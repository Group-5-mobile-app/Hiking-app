import React, { useState } from "react";
import { Alert, View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Button, TextInput, Card } from "react-native-paper";
import { loginUser } from "../firebase/auth";

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const user = await loginUser(email, password);
            Alert.alert("Kirjautuminen onnistui", `Tervetuloa takaisin, ${user.email}!`);
            navigation.navigate("Koti");
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <View style={styles.container}>
          <Text style={styles.title}>Kirjaudu sisään</Text>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.label}>Sähköposti</Text>
                <TextInput 
                  mode="outlined"
                  placeholder="Sähköposti" 
                  value={email} 
                  onChangeText={setEmail} 
                  textColor="white"
                  style={styles.input}
                />
              <Text style={styles.label}>Salasana</Text>
                <TextInput 
                  mode="outlined"
                  placeholder="Salasana" 
                  value={password} 
                  secureTextEntry
                  onChangeText={setPassword} 
                  textColor="white"
                  style={styles.input}
                /> 
              <Button 
              mode="contained" 
              style={styles.button}
              onPress={handleLogin} 
              >
                Kirjaudu sisään
              </Button>

              <TouchableOpacity onPress={() => navigation.navigate("Luo")}>
                <Text style={styles.link}>Ei tiliä? Luo tili.</Text> 
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </View>
    );
};


const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
      backgroundColor: "#616161",
  },
  title: {
      fontSize: 22,
      color: "#FFFFFF",
      marginBottom: 20,
      fontWeight: "bold",
      padding: 20,
  },
  card: {
      padding: 20,
      borderRadius: 10,
  },
  label: {
      color: "#FFFFF",
      marginBottom: 5,
  },
  input: {
      backgroundColor: "#757575",
  },
  button: {
      marginTop: 20,
  },
  link: {
      textAlign: "center",
      marginTop: 20,
      color: "#689f38",
  },
});

export default LoginScreen;