import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text, Card, Avatar, Divider, Portal, Dialog, Button, TextInput, IconButton, useTheme } from "react-native-paper";
import { auth, db } from "../firebase/firebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc, writeBatch } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bioText, setBioText] = useState("");
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [tempBioText, setTempBioText] = useState("");
    const [avatarBase64, setAvatarBase64] = useState(null);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [loadingAvatar, setLoadingAvatar] = useState(false);
    
    const [addFriendDialogVisible, setAddFriendDialogVisible] = useState(false);
    const [removeFriendDialogVisible, setRemoveFriendDialogVisible] = useState(false);
    
    const [friendEmail, setFriendEmail] = useState("");
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [errorDialogVisible, setErrorDialogVisible] = useState(false);

    const { i18n, t } = useTranslation();

    const theme = useTheme();
    const styles = getStyles(theme);

    useEffect(() => {
        setLoading(true);
        if (auth.currentUser) {
            setEmail(auth.currentUser.email);
            if (auth.currentUser.email) {
                const name = auth.currentUser.email.split('@')[0];
                setUsername(name.charAt(0).toUpperCase());
            }
            Promise.all([
                fetchFriends(),
                fetchUserBio(),
                fetchUserAvatarFromStorage()
            ]).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserAvatarFromStorage = async () => {
        setLoadingAvatar(true);
        try {
            const storedAvatar = await AsyncStorage.getItem('userAvatarBase64');
            if (storedAvatar) {
                setAvatarBase64(storedAvatar);
            }
        } catch (error) {
            console.error("Error fetching avatar from AsyncStorage:", error);
        } finally {
            setLoadingAvatar(false);
        }
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            setErrorMessage(t('profile.avatar.permission_denied'));
            setErrorDialogVisible(true);
            return;
        }
    
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'Images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.2,
            base64: true,
        });
    
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setLoadingAvatar(true);
            setIsEditingAvatar(false);
            try {
                let base64Data = result.assets[0].base64;

                if (!base64Data) {
                     console.log("Reading file as Base64...");
                     base64Data = await FileSystem.readAsStringAsync(result.assets[0].uri, {
                         encoding: FileSystem.EncodingType.Base64,
                     });
                }

                const sizeInBytes = base64Data.length * 0.75;
                const maxSizeInMB = 0.5;
                if (sizeInBytes > maxSizeInMB * 1024 * 1024) {
                     setErrorMessage(t('profile.avatar.too_large', { maxSize: maxSizeInMB }));
                     setErrorDialogVisible(true);
                     setLoadingAvatar(false);
                     return;
                }
                
                await AsyncStorage.setItem('userAvatarBase64', base64Data);
                setAvatarBase64(base64Data);
                
            } catch (error) {
                 console.error("Error processing/saving image:", error);
                 setErrorMessage(t('profile.avatar.save_error'));
                 setErrorDialogVisible(true);
            } finally {
                 setLoadingAvatar(false);
            }
        }
    };

    const fetchUserBio = async () => {
        try {
            const userRef = doc(db, "user", auth.currentUser.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists() && userDoc.data().bio) {
                setBioText(userDoc.data().bio);
                setTempBioText(userDoc.data().bio);
            } else {
                setBioText(t("profile.about_me_placeholder"));
                setTempBioText(t("profile.about_me_placeholder"));
            }
        } catch (error) {
            console.error("Error fetching user bio:", error);
            setBioText(t("profile.about_me_placeholder"));
            setTempBioText(t("profile.about_me_placeholder"));
        }
    };

    const handleSaveBio = async () => {
        try {
            const userRef = doc(db, "user", auth.currentUser.uid);
            await updateDoc(userRef, {
                bio: tempBioText
            });
            
            setBioText(tempBioText);
            setIsEditingBio(false);
        } catch (error) {
            console.error("Error saving bio:", error);
            setErrorMessage(t("profile.bio.save_error"));
            setErrorDialogVisible(true);
        }
    };

    const handleCancelBioEdit = () => {
        setTempBioText(bioText);
        setIsEditingBio(false);
    };

    const handleLanguageChange = async (lang) => {
        await AsyncStorage.setItem('language', lang);
        i18n.changeLanguage(lang);
    };

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const userRef = doc(db, "user", auth.currentUser.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists() && userDoc.data().friends) {
                const friendsList = [];
                
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
            setErrorMessage(t("profile.add_friend.empty_email"));
            setErrorDialogVisible(true);
            return;
        }
        const normalizedEmail = friendEmail.trim().toLowerCase();

        try {
            const usersRef = collection(db, "user");
            const q = query(usersRef, where("email", "==", normalizedEmail));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                setErrorMessage(t("profile.add_friend.user_not_found"));
                setErrorDialogVisible(true);
                return;
            }

            const friendDoc = querySnapshot.docs[0];
            const friendId = friendDoc.id;
            
            const userRef = doc(db, "user", auth.currentUser.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists() && userDoc.data().friends && userDoc.data().friends.includes(friendId)) {
                setErrorMessage(t("profile.add_friend.already_friend"));
                setErrorDialogVisible(true);
                return;
            }
            
            const batch = writeBatch(db);
            batch.update(userRef, {
                friends: arrayUnion(friendId)
            });
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
            setErrorMessage(t("profile.add_friend.error"));
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
            setErrorMessage(t("profile.remove_friend.error"));
            setErrorDialogVisible(true);
        }
    };

    const routes = [
        { id: 1, name: "Nuuksion kansallispuisto", length: 12.5, rating: 4.8, date: "15.3.2025" },
        { id: 2, name: "Pallas-Yllästunturi", length: 24.3, rating: 5.0, date: "23.2.2025" },
        { id: 3, name: "Kolin kansallispuisto", length: 8.7, rating: 4.5, date: "3.2.2025" },
        { id: 4, name: "Sipoonkorven reitti", length: 6.2, rating: 4.3, date: "1.12.2024" },
    ];

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
                                {loadingAvatar ? (
                                    <View style={styles.avatarContainer}>
                                        <ActivityIndicator size="large" color={theme.colors.primary} />
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={isEditingAvatar ? handlePickImage : undefined}
                                        disabled={!isEditingAvatar}
                                        style={styles.avatarContainer}
                                    >
                                        {avatarBase64 ? (
                                            <Avatar.Image
                                                size={70}
                                                source={{ uri: `data:image/jpeg;base64,${avatarBase64}` }}
                                            />
                                        ) : (
                                            <Avatar.Text
                                                size={70}
                                                label={username}
                                            />
                                        )}
                                        
                                        {/* Camera Icon Overlay */} 
                                        {isEditingAvatar && (
                                            <View style={styles.cameraOverlay}>
                                                <View style={styles.cameraIconBackground}>
                                                    <IconButton
                                                        icon="camera"
                                                        size={24} // Adjust size as needed with background
                                                        iconColor={theme.colors.onPrimary} // Color for icon on primary background
                                                        style={styles.cameraIcon}
                                                        disabled 
                                                    />
                                                </View>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                )}
                                <View style={styles.profileInfo}>
                                    <Text style={styles.label}>{email}</Text>
                                </View>
                                <IconButton
                                    icon="pencil"
                                    size={24}
                                    onPress={() => setIsEditingAvatar(!isEditingAvatar)}
                                    style={styles.editAvatarIcon}
                                    iconColor={isEditingAvatar ? theme.colors.primary : theme.colors.onSurfaceVariant}
                                />
                            </View>
                            
                            <Divider style={styles.divider} />
                            
                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{userStats.totalDistance} km</Text>
                                    <Text style={styles.statLabel}>{t("distance")}</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{userStats.totalSteps}</Text>
                                    <Text style={styles.statLabel}>{t("steps")}</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{userStats.totalRoutes}</Text>
                                    <Text style={styles.statLabel}>{t("routes")}</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    <Card style={styles.bioCard}>
                        <Card.Content>
                            <View style={styles.cardHeaderRow}>
                                <Text style={styles.cardTitle}>{t("profile.about_me")}</Text>
                                <IconButton
                                    icon={isEditingBio ? "check" : "pencil"}
                                    size={24}
                                    onPress={isEditingBio ? handleSaveBio : () => setIsEditingBio(true)}
                                />
                                {isEditingBio && (
                                    <IconButton
                                        icon="close"
                                        size={24}
                                        onPress={handleCancelBioEdit}
                                    />
                                )}
                            </View>
                            
                            {isEditingBio ? (
                                <TextInput
                                    value={tempBioText}
                                    onChangeText={setTempBioText}
                                    mode="outlined"
                                    multiline
                                    numberOfLines={4}
                                    style={styles.bioTextInput}
                                />
                            ) : (
                                <Text style={styles.bioText}>
                                    {bioText}
                                </Text>
                            )}
                        </Card.Content>
                    </Card>

                    <Card style={styles.routesCard}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>{t("profile.my_routes")}</Text>
                            
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

                    <Card style={styles.friendsCard}>
                        <Card.Content>
                            <View style={styles.cardHeaderRow}>
                                <Text style={styles.cardTitle}>{t("profile.friends")}</Text>
                                <IconButton
                                    icon="plus"
                                    size={24}
                                    onPress={() => setAddFriendDialogVisible(true)}
                                />
                            </View>
                            
                            {!loading && friends.length === 0 ? (
                                <Text style={styles.emptyListText}>{t("profile.no_friends")}</Text>
                            ) : (
                                friends.map((friend) => (
                                    <View key={friend.id} style={styles.friendItem}>
                                        <Avatar.Text 
                                            size={40} 
                                            label={friend.avatar} 
                                        />
                                        <View style={styles.friendInfo}>
                                            <Text style={styles.friendName}>{friend.name}</Text>
                                            <Text style={styles.friendStats}>{friend.trails} {t("profile.trails")}</Text>
                                        </View>
                                        <IconButton
                                            icon="close"
                                            size={20}
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

                    <Card style={styles.languageCard}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>{t("set_language")}</Text>
                            <View style={styles.languageButtons}>
                                <Button mode="contained" onPress={() => handleLanguageChange("fi")}>{t("finnish")}</Button>
                                <Button mode="contained" onPress={() => handleLanguageChange("en")}>{t("english")}</Button>
                            </View>
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
                
                <Portal>
                    <Dialog visible={errorDialogVisible} onDismiss={() => setErrorDialogVisible(false)}>
                        <Dialog.Title>{t("error")}</Dialog.Title>
                        <Dialog.Content>
                            <Text>{errorMessage}</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setErrorDialogVisible(false)}>{t("ok")}</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </ScrollView>
        </>
    );
};

const AddFriendDialog = ({ visible, onDismiss, onAdd, email, onChangeEmail }) => {
    const { t } = useTranslation();
    
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>{t("profile.add_friend.title")}</Dialog.Title>
                <Dialog.Content>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        keyboardVerticalOffset={100}
                    >
                        <TextInput
                            label={t("profile.add_friend.email_label")}
                            value={email}
                            onChangeText={onChangeEmail}
                            mode="outlined"
                            style={{ marginBottom: 10}}
                            autoComplete="off"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            returnKeyType="done"
                        />
                    </KeyboardAvoidingView>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss}>{t("profile.add_friend.cancel")}</Button>
                    <Button onPress={onAdd}>{t("profile.add_friend.add")}</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const RemoveFriendDialog = ({ visible, onDismiss, onRemove, friend }) => {
    const { t } = useTranslation();
    
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>{t("profile.remove_friend.title")}</Dialog.Title>
                <Dialog.Content>
                    <Text>{t("profile.remove_friend.confirm", { name: friend?.name || friend?.email })}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss}>{t("profile.remove_friend.cancel")}</Button>
                    <Button onPress={onRemove}>{t("profile.remove_friend.remove")}</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const getStyles = (theme) =>
    StyleSheet.create({
      scrollContainer: {
          flexGrow: 1,
          backgroundColor: theme.colors.background,
      },
      container: {
          flex: 1,
          alignItems: "center",
          padding: 20,
          backgroundColor: theme.colors.background,
      },
      profileCard: {
          width: "100%",
          marginBottom: 20,
          backgroundColor: theme.colors.surface,
      },
      bioCard: {
          width: "100%",
          marginBottom: 20,
          backgroundColor: theme.colors.surface,
      },
      routesCard: {
          width: "100%",
          marginBottom: 20,
          backgroundColor: theme.colors.surface,
      },
      friendsCard: {
          width: "100%",
          backgroundColor: theme.colors.surface,
      },
      cardTitle: {
          fontSize: 20,
          fontWeight: "bold",
          marginBottom: 15,
          color: theme.colors.onSurface,
      },
      label: {
          fontSize: 18,
          marginBottom: 5,
          color: theme.colors.onSurface,
      },
      bioText: {
          fontSize: 16,
          lineHeight: 24,
          color: theme.colors.onSurfaceVariant ?? theme.colors.onSurface,
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
          color: theme.colors.onSurface,
      },
      friendStats: {
          fontSize: 14,
          color: theme.colors.onSurfaceVariant ?? theme.colors.onSurface,
      },
      profileHeader: {
          flexDirection: "row",
          alignItems: "center",
          position: 'relative',
      },
      avatarContainer: {
          width: 70,
          height: 70,
          marginRight: 20,
          borderRadius: 35,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceVariant,
          position: 'relative',
          overflow: 'hidden',
      },
      cameraOverlay: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1,
      },
      cameraIconBackground: {
          backgroundColor: theme.colors.primary + 'aa',
          borderRadius: 20,
          padding: 4,
      },
      cameraIcon: {
          margin: 0,
      },
      profileInfo: {
          flexDirection: "column",
          flex: 1,
          justifyContent: 'center',
      },
      editAvatarIcon: {
          position: 'absolute',
          right: -10,
          top: -10,
          zIndex: 2,
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
      },
      divider: {
          marginVertical: 15,
          backgroundColor: theme.colors.outline,
          height: 1,
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
          color: theme.colors.primary,
      },
      statLabel: {
          fontSize: 14,
          opacity: 0.8,
          color: theme.colors.onSurfaceVariant ?? theme.colors.onSurface,
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
          flex: 1,
          color: theme.colors.onSurface,
      },
      routeRating: {
          fontSize: 16,
          fontWeight: "bold",
          color: theme.colors.primary,
      },
      routeDetails: {
          marginTop: 5,
          marginBottom: 8,
      },
      routeInfo: {
          fontSize: 14,
          opacity: 0.8,
          color: theme.colors.onSurfaceVariant ?? theme.colors.onSurface,
      },
      routeDivider: {
          opacity: 0.2,
          marginTop: 2,
          backgroundColor: theme.colors.outline,
          height: 1,
      },
      cardHeaderRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
      },
      emptyListText: {
          fontSize: 14,
          fontStyle: "italic",
          textAlign: "center",
          marginTop: 10,
          marginBottom: 20,
          color: theme.colors.onSurfaceVariant ?? theme.colors.onSurface,
      },
      languageCard: {
          width: "100%",
          marginBottom: 20,
          marginTop: 20,
          backgroundColor: theme.colors.surface,
      },
      languageButtons: {
          flexDirection: "row",
          justifyContent: "space-evenly",
          gap: 10,
      },
      bioTextInput: {
          backgroundColor: theme.colors.background,
          fontSize: 16,
      },
  });
  

export default ProfileScreen;