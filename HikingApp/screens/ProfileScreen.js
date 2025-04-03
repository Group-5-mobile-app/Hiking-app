import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Text, Card, Avatar, Divider, Portal, Dialog, Button, TextInput, IconButton } from "react-native-paper";
import { auth, db } from "../firebase/firebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc, writeBatch } from "firebase/firestore";
import theme from "../components/theme";

const ProfileScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [addFriendDialogVisible, setAddFriendDialogVisible] = useState(false);
    const [removeFriendDialogVisible, setRemoveFriendDialogVisible] = useState(false);
    
    const [friendEmail, setFriendEmail] = useState("");
    const [selectedFriend, setSelectedFriend] = useState(null);

    useEffect(() => {
        if (auth.currentUser) {
            setEmail(auth.currentUser.email);
            // avatariin emailin ensimmäinen kirjain
            if (auth.currentUser.email) {
                const name = auth.currentUser.email.split('@')[0];
                setUsername(name.charAt(0).toUpperCase());
            }
            fetchFriends();
        }
    }, []);

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const userRef = doc(db, "user", auth.currentUser.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists() && userDoc.data().friends) {
                const friendsList = [];
                
                // hae kaverien data
                for (const friendId of userDoc.data().friends) {
                    const friendRef = doc(db, "user", friendId);
                    const friendDoc = await getDoc(friendRef);
                    
                    if (friendDoc.exists()) {
                        const friendData = friendDoc.data();
                        const friendEmail = friendData.email;
                        const name = friendEmail.split('@')[0];
                        const avatar = name.charAt(0).toUpperCase();
                        
                        friendsList.push({
                            id: friendId,
                            name: friendData.displayName || friendEmail,
                            email: friendEmail,
                            avatar: avatar,
                            trails: friendData.completedTrails?.length || 0
                        });
                    }
                }
                
                setFriends(friendsList);
            } else {
                setFriends([]);
            }
        } catch (error) {
            console.error("Error fetching friends:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFriend = async () => {
        if (!friendEmail.trim()) {
            setErrorMessage("Sähköposti on tyhjä");
            setErrorDialogVisible(true);
            return;
        }
        const normalizedEmail = friendEmail.trim().toLowerCase();

        try {
            // etsi käyttäjä emaililla
            const usersRef = collection(db, "user");
            const q = query(usersRef, where("email", "==", normalizedEmail));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                setErrorMessage("Käyttäjää ei löydy");
                setErrorDialogVisible(true);
                return;
            }

            const friendDoc = querySnapshot.docs[0];
            const friendId = friendDoc.id;
            
            // onko jo kaveri
            const userRef = doc(db, "user", auth.currentUser.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists() && userDoc.data().friends && userDoc.data().friends.includes(friendId)) {
                setErrorMessage("Käyttäjä on jo kaverisi");
                setErrorDialogVisible(true);
                return;
            }
            
            const batch = writeBatch(db);
            batch.update(userRef, {
                friends: arrayUnion(friendId)
            });
            // lisää kaveri myös kaverin kaverilistalle
            const friendRef = doc(db, "user", friendId);
            batch.update(friendRef, {
                friends: arrayUnion(auth.currentUser.uid)
            });
            await batch.commit();
            await fetchFriends();
            
            setAddFriendDialogVisible(false);
            setFriendEmail("");
            
        } catch (error) {
            console.error("Error adding friend:", error);
            setErrorMessage("Virhe kaverin lisäämisessä");
            setErrorDialogVisible(true);
        }
    };

    const handleRemoveFriend = async () => {
        if (!selectedFriend) return;
    
        try {
            const userRef = doc(db, "user", auth.currentUser.uid);
            await updateDoc(userRef, {
                friends: arrayRemove(selectedFriend.id)
            });
            
            await fetchFriends();
        
            setRemoveFriendDialogVisible(false);
            setSelectedFriend(null);
            
        } catch (error) {
            console.error("Error removing friend:", error);
            setErrorMessage("Virhe ystävän poistamisessa");
            setErrorDialogVisible(true);
        }
    };

    // placeholder reitti dataa
    const routes = [
        { id: 1, name: "Nuuksion kansallispuisto", length: 12.5, rating: 4.8, date: "15.3.2025" },
        { id: 2, name: "Pallas-Yllästunturi", length: 24.3, rating: 5.0, date: "23.2.2025" },
        { id: 3, name: "Kolin kansallispuisto", length: 8.7, rating: 4.5, date: "3.2.2025" },
        { id: 4, name: "Sipoonkorven reitti", length: 6.2, rating: 4.3, date: "1.12.2024" },
    ];

    // placeholder tilasto dataa
    const userStats = {
        totalDistance: 178.5,
        totalSteps: 236400,
        totalRoutes: 14
    };

    return (
        <>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <Card style={styles.profileCard}>
                        <Card.Content>
                            <View style={styles.profileHeader}>
                                <Avatar.Text 
                                    size={70} 
                                    label={username} 
                                    backgroundColor={theme.colors.secondary}
                                    style={styles.avatar}
                                />
                                <View style={styles.profileInfo}>
                                    <Text style={styles.label}>{email}</Text>
                                </View>
                            </View>
                            
                            <Divider style={styles.divider} />
                            
                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{userStats.totalDistance} km</Text>
                                    <Text style={styles.statLabel}>Kuljettu</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{userStats.totalSteps}</Text>
                                    <Text style={styles.statLabel}>Askelia</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{userStats.totalRoutes}</Text>
                                    <Text style={styles.statLabel}>Reittejä</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Bio Card */}
                    <Card style={styles.bioCard}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>Tietoa minusta</Text>
                            <Text style={styles.bioText}>
                                Hei! Olen innokas vaeltaja ja luonnon ystävä. Pidän erityisesti 
                                vuoristoreiteistä ja uusien polkujen löytämisestä. Olen vaeltanut 
                                Suomessa useilla eri reiteillä ja tavoitteenani on tutustua 
                                kaikkiin kansallispuistoihin.
                            </Text>
                        </Card.Content>
                    </Card>

                    {/* Routes Card */}
                    <Card style={styles.routesCard}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>Omat Reitit</Text>
                            
                            {routes.map((route) => (
                                <View key={route.id} style={styles.routeItem}>
                                    <View style={styles.routeHeader}>
                                        <Text style={styles.routeName}>{route.name}</Text>
                                        <Text style={styles.routeRating}>★ {route.rating}</Text>
                                    </View>
                                    <View style={styles.routeDetails}>
                                        <Text style={styles.routeInfo}>{route.length} km • {route.date}</Text>
                                    </View>
                                    <Divider style={styles.routeDivider} />
                                </View>
                            ))}
                        </Card.Content>
                    </Card>

                    {/* Friends Card */}
                    <Card style={styles.friendsCard}>
                        <Card.Content>
                            <View style={styles.cardHeaderRow}>
                                <Text style={styles.cardTitle}>Kaverit</Text>
                                <IconButton
                                    icon="plus"
                                    size={24}
                                    iconColor={theme.colors.text}
                                    onPress={() => setAddFriendDialogVisible(true)}
                                />
                            </View>
                            
                            {!loading && friends.length === 0 ? (
                                <Text style={styles.emptyListText}>Ei vielä kavereita.</Text>
                            ) : (
                                friends.map((friend) => (
                                    <View key={friend.id} style={styles.friendItem}>
                                        <Avatar.Text 
                                            size={40} 
                                            label={friend.avatar} 
                                            backgroundColor={theme.colors.secondary}
                                        />
                                        <View style={styles.friendInfo}>
                                            <Text style={styles.friendName}>{friend.name}</Text>
                                            <Text style={styles.friendStats}>{friend.trails} reittiä</Text>
                                        </View>
                                        <IconButton
                                            icon="close"
                                            size={20}
                                            iconColor={theme.colors.text}
                                            onPress={() => {
                                                setSelectedFriend(friend);
                                                setRemoveFriendDialogVisible(true);
                                            }}
                                        />
                                    </View>
                                ))
                            )}
                        </Card.Content>
                    </Card>
                </View>
                
                <AddFriendDialog 
                    visible={addFriendDialogVisible}
                    onDismiss={() => setAddFriendDialogVisible(false)}
                    onAdd={handleAddFriend}
                    email={friendEmail}
                    onChangeEmail={setFriendEmail}
                />
                <RemoveFriendDialog 
                    visible={removeFriendDialogVisible}
                    onDismiss={() => setRemoveFriendDialogVisible(false)}
                    onRemove={handleRemoveFriend}
                    friend={selectedFriend}
                />
            </ScrollView>
        </>
    );
};

const AddFriendDialog = ({ visible, onDismiss, onAdd, email, onChangeEmail }) => (
    <Portal>
        <Dialog visible={visible} onDismiss={onDismiss}>
            <Dialog.Title>Lisää kaveri</Dialog.Title>
            <Dialog.Content>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={100}
                >
                    <TextInput
                        label="Kaverin sähköposti"
                        value={email}
                        onChangeText={onChangeEmail}
                        mode="outlined"
                        style={{ marginBottom: 10, backgroundColor: theme.colors.text}}
                        autoComplete="off"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="done"
                    />
                </KeyboardAvoidingView>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={onDismiss}>Peruuta</Button>
                <Button onPress={onAdd}>Lisää</Button>
            </Dialog.Actions>
        </Dialog>
    </Portal>
);

const RemoveFriendDialog = ({ visible, onDismiss, onRemove, friend }) => (
    <Portal>
        <Dialog visible={visible} onDismiss={onDismiss}>
            <Dialog.Title>Poista kaveri</Dialog.Title>
            <Dialog.Content>
                <Text>Haluatko varmasti poistaa kaverin {friend?.name || friend?.email}?</Text>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={onDismiss}>Peruuta</Button>
                <Button onPress={onRemove}>Poista</Button>
            </Dialog.Actions>
        </Dialog>
    </Portal>
);

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: theme.colors.background,
        padding: 20,
    },
    profileCard: {
        width: "100%",
        marginBottom: 20,
        backgroundColor: theme.colors.primary,
        color: theme.colors.text
    },
    bioCard: {
        width: "100%",
        marginBottom: 20,
        backgroundColor: theme.colors.primary,
        color: theme.colors.text
    },
    routesCard: {
        width: "100%",
        marginBottom: 20,
        backgroundColor: theme.colors.primary,
        color: theme.colors.text
    },
    friendsCard: {
        width: "100%",
        backgroundColor: theme.colors.primary,
        color: theme.colors.text
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        color: theme.colors.text,
    },
    label: {
        fontSize: 18,
        marginBottom: 5,
        color: theme.colors.text,
    },
    bioText: {
        fontSize: 16,
        lineHeight: 24,
        color: theme.colors.text,
    },
    friendItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    friendInfo: {
        marginLeft: 15,
        flex: 1,
    },
    friendName: {
        fontSize: 16,
        fontWeight: "bold",
        color: theme.colors.text,
    },
    friendStats: {
        fontSize: 14,
        color: theme.colors.text,
    },
    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        marginRight: 20,
    },
    profileInfo: {
        flexDirection: "column",
        flex: 1,
    },
    divider: {
        marginVertical: 15,
        backgroundColor: theme.colors.text,
        opacity: 0.2,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 5,
    },
    statItem: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: theme.colors.text,
    },
    statLabel: {
        fontSize: 14,
        color: theme.colors.text,
        opacity: 0.8,
    },
    routeItem: {
        marginBottom: 10,
    },
    routeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    routeName: {
        fontSize: 16,
        fontWeight: "bold",
        color: theme.colors.text,
        flex: 1,
    },
    routeRating: {
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: "bold",
    },
    routeDetails: {
        marginTop: 5,
        marginBottom: 8,
    },
    routeInfo: {
        fontSize: 14,
        color: theme.colors.text,
        opacity: 0.8,
    },
    routeDivider: {
        backgroundColor: theme.colors.text,
        opacity: 0.2,
        marginTop: 2,
    },
    cardHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    emptyListText: {
        fontSize: 14,
        color: theme.colors.text,
        fontStyle: "italic",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 20,
    },
});

export default ProfileScreen;