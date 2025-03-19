import { StyleSheet, View, Text, ActivityIndicator, Button } from "react-native";
import React, { useState } from "react";

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  if (loading) return <ActivityIndicator size="large" />;
    return (
        <View style={styles.view}>
            <Text style={styles.text}>Welcome</Text>
            <Button title="Login" onPress={() => navigation.navigate("LoginScreen")} />
        </View>
    );
};

const styles = StyleSheet.create({
  view: {
    padding: 20,
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    marginBottom: 10,
  },
});

export default HomeScreen;