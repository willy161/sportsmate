import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import { app } from '../auth/firebaseConfig';
import { connect } from 'react-redux';
import { getAuth } from 'firebase/auth';
import { getFirestore, onSnapshot, doc, orderBy, query, collection } from 'firebase/firestore';

function Profile(props) {
    const [userPost, setUserPosts] = useState([]);
    const [user, setUser] = useState(null);
    useEffect(() => {
        const { currentUser, posts } = props;
    
        if (props.route.params.uid === getAuth(app).currentUser.uid) {
            setUser(currentUser);
            setUserPosts(posts);
        } else {
            const auth = getAuth(app);
            const firestore = getFirestore(app);
            const userDocRef = doc(firestore, "users", props.route.params.uid);
            const userPostsQuery = query(
                collection(firestore, 'posts', props.route.params.uid, 'userPosts'),
                orderBy('creation', 'asc')
            );
    
            const userUnsubscribe = onSnapshot(userDocRef, (snapshot) => {
                if (snapshot.exists()) {
                    setUser(snapshot.data());
                } else {
                    console.log("User does not exist");
                }
            }, (error) => {
                console.error("Error fetching user data: ", error);
            });
    
            const postsUnsubscribe = onSnapshot(userPostsQuery, (snapshot) => {
                let posts = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    const id = doc.id;
                    return { id, ...data };
                });
                setUserPosts(posts);
            }, (error) => {
                console.error('Error fetching user posts: ', error);
            });
    
            return () => {
                userUnsubscribe();
                postsUnsubscribe();
            };
        }
    }, [props.route.params.uid, props.currentUser, props.posts]);
    
    
    const { currentUser, posts } = props;
    console.log({ currentUser, posts });
    if(user === null) {
        return <View/>
    }
  return (
    <View style={styles.container}>
        <View style={styles.containerInfo}>
        <Text>{user.name}Profile</Text>
        </View>
        <View style={styles.containerGallery}>
            <FlatList
                numColumns={3}
                horizontal={false}
                data={userPosts}
                renderItem={({item}) =>(
                    <View style={styles.containerImage}>
                    <Image
                        style={styles.image}
                        source={{uri: item.downloadURL}}
                    />
                    </View>
                )}
            />
        </View>
    </View>
  )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 40
    },
    containerInfo: {
        margin: 20
    },
    containerGallery: {
        flex: 1
    },
    image:{
        flex: 1,
        aspectRatio: 1/1
    },
    containerImage: {
        flex: 1/3
    }
})
const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    posts: store.userState.posts
})

export default connect(mapStateToProps, null)(Profile);