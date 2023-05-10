import React, { useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Button } from 'react-native';
import { connect } from 'react-redux';
import { getUserLocation } from '../../redux/actions/index';
import { app } from '../auth/firebaseConfig';
import { getAuth } from 'firebase/auth';

function Profile(props) {
  const { currentUser, posts } = props;
  console.log({ currentUser, posts });

  const onLogout = () => {
    const auth = getAuth(app);
    auth.signOut();
  };

  useEffect(() => {
    const fetchUserLocation = async () => {
      const location = await getUserLocation();
      console.log('User location:', location);
    };

    fetchUserLocation();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        <Text>{currentUser.name}</Text>
        <Text>{currentUser.email}</Text>
        <Button title="Logout" onPress={() => onLogout()} />
      </View>
      <View style={styles.containerGallery}>
        <FlatList
          numColumns={3}
          horizontal={false}
          data={posts}
          renderItem={({ item }) => (
            <View style={styles.containerImage}>
              <Image style={styles.image} source={{ uri: item.downloadURL }} />
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  containerInfo: {
    margin: 20,
  },
  containerGallery: {
    flex: 1,
  },
  containerImage: {
    flex: 1 / 3,
  },
  image: {
    flex: 1,
    aspectRatio: 1 / 1,
  },
});

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  posts: store.userState.posts,
});

export default connect(mapStateToProps, null)(Profile);
