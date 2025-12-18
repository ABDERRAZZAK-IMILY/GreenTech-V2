import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserService from '../services/userService';
import colors from '../styles/colors';

const EditProfileScreen = ({ navigation, route }) => {
  const { user, mode } = route.params || { user: {}, mode: 'profile' };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert("Erreur", "Veuillez remplir les champs du profil");
      return;
    }
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      await UserService.updateUser(userId, formData);
      Alert.alert("Succès", "Informations mises à jour avec succès");
      navigation.goBack(); // Nra3jou automatiqement
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le profil");
    } finally { setLoading(false); }
  };

  const handleUpdatePassword = async () => {
    if (!passwords.oldPassword || !passwords.newPassword) {
      Alert.alert("Erreur", "Veuillez remplir les champs de sécurité");
      return;
    }
    setLoading(true);
    try {
      await UserService.updatePassword(passwords.oldPassword, passwords.newPassword);
      Alert.alert("Succès", "Mot de passe modifié avec succès");
      setPasswords({ oldPassword: '', newPassword: '' });
      navigation.goBack(); 
    } catch (error) {
      Alert.alert("Erreur", "Ancien mot de passe incorrect");
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      {/* Handle dyal Modal */}
      <View style={styles.modalHandle} />
      
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {mode === 'profile' ? 'Modifier le profil' : 'Sécurité'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      {/* FIX: KeyboardAvoidingView bach l-clavier mayghatich l-inputs */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          
          {mode === 'profile' && (
            <View>
              <Text style={styles.sectionTitle}>Informations Personnelles</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nom complet</Text>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    style={styles.input} 
                    value={formData.name} 
                    onChangeText={(t) => setFormData({...formData, name: t})} 
                    placeholder="Votre nom"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Adresse Email</Text>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    style={styles.input} 
                    value={formData.email} 
                    onChangeText={(t) => setFormData({...formData, email: t})} 
                    placeholder="Votre email"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile} disabled={loading}>
                 {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Enregistrer</Text>}
              </TouchableOpacity>
            </View>
          )}

          {mode === 'password' && (
            <View>
              <Text style={styles.sectionTitle}>Sécurité</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ancien mot de passe</Text>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    style={styles.input} 
                    secureTextEntry 
                    value={passwords.oldPassword} 
                    onChangeText={(t) => setPasswords({...passwords, oldPassword: t})} 
                    placeholder="••••••••"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nouveau mot de passe</Text>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    style={styles.input} 
                    secureTextEntry 
                    value={passwords.newPassword} 
                    onChangeText={(t) => setPasswords({...passwords, newPassword: t})} 
                    placeholder="••••••••"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
              <TouchableOpacity style={[styles.saveButton, {backgroundColor: colors.textSecondary}]} onPress={handleUpdatePassword} disabled={loading}>
                 {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Changer le mot de passe</Text>}
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  container: { flex: 1, backgroundColor: colors.background },
  headerContainer: {
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  content: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.accent, marginBottom: 15, marginTop: 10 },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 15,
    height: 50,
  },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary },
  saveButton: {
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});

export default EditProfileScreen;