import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient'; 
import AuthService from '../services/authService';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name, value) => setFormData({ ...formData, [name]: value });

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await AuthService.login(formData.email, formData.password);
      console.log(response);
      navigation.replace('MainApp');
    } catch (err) {
      console.log(err);
      setError("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0a0e27', '#1a1f3a', '#0f1419']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      {/* Floating Shapes */}
      <View style={styles.floatingShapes}>
        <LinearGradient colors={['#0f4c3a', '#1b6e4f']} style={[styles.shape, styles.shape1]} />
        <LinearGradient colors={['#2a9d6f', '#38b87c']} style={[styles.shape, styles.shape2]} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          {/* Login Card (Glassmorphism) */}
          <View style={[styles.loginCard, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            
            {/* Header */}
            <View style={styles.header}>
              <LinearGradient colors={['#0f4c3a', '#1b6e4f']} style={styles.logoContainer}>
                <FontAwesome name="leaf" size={32} color="white" />
              </LinearGradient>
              <Text style={styles.title}>GreenTech Dashboard</Text>
              <Text style={styles.subtitle}>Connectez-vous pour accéder à votre espace</Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <FontAwesome name="exclamation-circle" size={16} color="#fca5a5" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <FontAwesome name="envelope" size={14} color="#2a9d6f" /> Email
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="admin@greentech.com"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => handleChange('email', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <FontAwesome name="lock" size={14} color="#2a9d6f" /> Mot de passe
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(text) => handleChange('password', text)}
                />
              </View>

              <TouchableOpacity onPress={handleLogin} disabled={loading}>
                <LinearGradient
                  colors={['#0f4c3a', '#2a9d6f']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.button}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={styles.buttonContent}>
                      <FontAwesome name="sign-in" size={18} color="#fff" style={{marginRight: 10}} />
                      <Text style={styles.buttonText}>Se connecter</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Features Footer */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <FontAwesome name="line-chart" size={24} color="#2ecc71" />
              <Text style={styles.featureText}>Suivi temps réel</Text>
            </View>
            <View style={styles.featureItem}>
              <FontAwesome name="shield" size={24} color="#2ecc71" />
              <Text style={styles.featureText}>Sécurisé</Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
  },
  floatingShapes: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  shape: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.4,
  },
  shape1: {
    width: 300,
    height: 300,
    top: -50,
    left: -100,
  },
  shape2: {
    width: 250,
    height: 250,
    bottom: -50,
    right: -80,
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#0f4c3a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#fca5a5',
    marginLeft: 10,
    fontSize: 13,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: 'white',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#1b6e4f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginTop: 40,
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: 120,
  },
  featureText: {
    marginTop: 8,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LoginScreen;