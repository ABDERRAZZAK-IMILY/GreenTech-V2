import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { dailyActions as initialActions, currentPosition, tripData } from '../data/dailyActions';
import { useEmployee } from '../contexts/EmployeeContext';
import colors from '../styles/colors';


export default function ActionsScreen() {
  const [dailyActions, setDailyActions] = useState(initialActions);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [proofImage, setProofImage] = useState(null);

  const { submitActionForApproval } = useEmployee();

  const completedActions = dailyActions.filter(a => a.submitted).length;
  const totalPoints = dailyActions.filter(a => a.submitted).reduce((sum, a) => sum + a.points, 0);
  const completionPercentage = (completedActions / dailyActions.length) * 100;

  const handleActionClick = (action) => {
    if (action.submitted) return;

    if (action.requiresProof) {
      setSelectedAction(action);
      setShowUploadModal(true);
      setProofImage(null);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder aux photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProofImage(result.assets[0].uri);
    }
  };

  const submitActionWithProof = () => {
    if (!selectedAction || !proofImage) {
      Alert.alert('Photo requise', 'Veuillez ajouter une photo comme preuve');
      return;
    }

    // Submit to pending actions
    submitActionForApproval({
      employeeName: "Mohammed Alami",
      actionName: selectedAction.title,
      points: selectedAction.points,
      proofImage: proofImage
    });

    // Mark as submitted
    setDailyActions(dailyActions.map(action =>
      action.id === selectedAction.id
        ? { ...action, submitted: true, completed: true }
        : action
    ));

    Alert.alert(
      'Demande envoyée!',
      'Votre action a été envoyée pour validation par un administrateur',
      [{ text: 'OK' }]
    );

    setShowUploadModal(false);
    setSelectedAction(null);
    setProofImage(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mes Actions Quotidiennes</Text>
          <Text style={styles.headerSubtitle}>Suivez vos actions écologiques et votre trajet du jour</Text>
        </View>

        {/* Checklist Section with Progress */}
        <View style={styles.checklistWrapper}>
          {/* Checklist Section */}
          <View style={styles.checklistSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitle}>
                <Ionicons name="checkbox" size={20} color={colors.accent} />
                <Text style={styles.sectionTitleText}>Checklist du Jour</Text>
              </View>
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={14} color="#fb923c" />
                <Text style={styles.streakText}>7 jours consécutifs</Text>
              </View>
            </View>

            <View style={styles.actionsGrid}>
              {dailyActions.map((action, index) => (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.actionItem,
                    action.submitted && styles.actionItemSubmitted
                  ]}
                  onPress={() => handleActionClick(action)}
                  disabled={action.submitted}
                >
                  <View style={styles.actionCheckbox}>
                    <Ionicons
                      name={action.submitted ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={action.submitted ? colors.accent : 'rgba(255,255,255,0.3)'}
                    />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle} numberOfLines={2}>{action.title}</Text>
                    <View style={styles.actionPoints}>
                      <Ionicons name="wallet" size={11} color="#feca57" />
                      <Text style={styles.actionPointsText}>+{action.points}</Text>
                    </View>
                  </View>
                  {action.submitted && (
                    <View style={styles.validationBadge}>
                      <Ionicons name="time" size={10} color="#f59e0b" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Progress Circle Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressCircleContainer}>
              {/* Simple circular progress representation */}
              <View style={styles.progressCircle}>
                <Text style={styles.progressPercentage}>{Math.round(completionPercentage)}%</Text>
                <Text style={styles.progressLabel}>Complété</Text>
              </View>
            </View>
            <View style={styles.progressDetails}>
              <View style={styles.progressStat}>
                <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                <View>
                  <Text style={styles.statValue}>{completedActions}/{dailyActions.length}</Text>
                  <Text style={styles.statLabel}>Actions</Text>
                </View>
              </View>
              <View style={styles.progressStat}>
                <Ionicons name="wallet" size={24} color={colors.accent} />
                <View>
                  <Text style={styles.statValue}>+{totalPoints}</Text>
                  <Text style={styles.statLabel}>Points</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Transport Tracking Section */}
        <View style={styles.transportSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitle}>
              <Ionicons name="navigate" size={20} color={colors.accent} />
              <Text style={styles.sectionTitleText}>Suivi Transport en Temps Réel</Text>
            </View>
            <View style={styles.liveIndicator}>
              <View style={styles.pulseDot} />
              <Text style={styles.liveText}>En direct</Text>
            </View>
          </View>

          {/* Current Position Card */}
          <View style={styles.trackingCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={18} color={colors.accent} />
              <Text style={styles.cardHeaderText}>Position Actuelle</Text>
            </View>
            <View style={styles.locationInfo}>
              <View style={styles.locationIcon}>
                <Ionicons name="navigate-circle" size={24} color="#fff" />
              </View>
              <View style={styles.locationDetails}>
                <Text style={styles.locationAddress}>{currentPosition.address}</Text>
                <Text style={styles.locationCoords}>
                  {currentPosition.lat.toFixed(4)}°N, {Math.abs(currentPosition.lng).toFixed(4)}°W
                </Text>
              </View>
            </View>
            <View style={styles.positionStats}>
              <View style={styles.positionStat}>
                <Ionicons name="speedometer" size={18} color={colors.accent} />
                <View>
                  <Text style={styles.positionValue}>{currentPosition.speed} km/h</Text>
                  <Text style={styles.positionLabel}>Vitesse</Text>
                </View>
              </View>
              <View style={styles.positionStat}>
                <Ionicons name="water" size={18} color={colors.accent} />
                <View>
                  <Text style={styles.positionValue}>{currentPosition.fuelConsumption} L/100km</Text>
                  <Text style={styles.positionLabel}>Consommation</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Trip Summary Card */}
          <View style={[styles.trackingCard, styles.marginTop]}>
            <View style={styles.cardHeader}>
              <Ionicons name="map" size={18} color={colors.accent} />
              <Text style={styles.cardHeaderText}>Trajet d'Aujourd'hui</Text>
            </View>
            <View style={styles.tripStatsGrid}>
              <View style={styles.tripStat}>
                <View style={[styles.tripStatIcon, { backgroundColor: '#3b82f6' }]}>
                  <Ionicons name="navigate" size={16} color="#fff" />
                </View>
                <View>
                  <Text style={styles.tripStatValue}>{tripData.distance} km</Text>
                  <Text style={styles.tripStatLabel}>Distance</Text>
                </View>
              </View>
              <View style={styles.tripStat}>
                <View style={[styles.tripStatIcon, { backgroundColor: '#f59e0b' }]}>
                  <Ionicons name="time" size={16} color="#fff" />
                </View>
                <View>
                  <Text style={styles.tripStatValue}>{tripData.duration}</Text>
                  <Text style={styles.tripStatLabel}>Durée</Text>
                </View>
              </View>
              <View style={styles.tripStat}>
                <View style={[styles.tripStatIcon, { backgroundColor: '#667eea' }]}>
                  <Ionicons name="speedometer" size={16} color="#fff" />
                </View>
                <View>
                  <Text style={styles.tripStatValue}>{tripData.avgSpeed} km/h</Text>
                  <Text style={styles.tripStatLabel}>Vitesse Moy.</Text>
                </View>
              </View>
              <View style={styles.tripStat}>
                <View style={[styles.tripStatIcon, { backgroundColor: colors.accent }]}>
                  <Ionicons name="star" size={16} color="#fff" />
                </View>
                <View>
                  <Text style={styles.tripStatValue}>{tripData.ecoScore}/100</Text>
                  <Text style={styles.tripStatLabel}>Score Éco</Text>
                </View>
              </View>
            </View>
            <View style={styles.ecoSavings}>
              <View style={styles.savingItem}>
                <Ionicons name="leaf" size={14} color={colors.secondary} />
                <Text style={styles.savingText}>{tripData.co2Saved} kg CO2 économisé</Text>
              </View>
              <View style={styles.savingItem}>
                <Ionicons name="water" size={14} color={colors.secondary} />
                <Text style={styles.savingText}>{tripData.fuelSaved} L carburant économisé</Text>
              </View>
            </View>
          </View>

          
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showUploadModal}
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Ionicons name="camera" size={20} color={colors.accent} />
                <Text style={styles.modalTitle}>Joindre une preuve</Text>
              </View>
              <TouchableOpacity onPress={() => setShowUploadModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.actionInfo}>
                <Text style={styles.actionInfoTitle}>{selectedAction?.title}</Text>
                <View style={styles.actionInfoPoints}>
                  <Ionicons name="wallet" size={14} color="#feca57" />
                  <Text style={styles.actionInfoPointsText}>+{selectedAction?.points} points</Text>
                </View>
              </View>

              <View style={styles.proofInstructions}>
                <Ionicons name="information-circle" size={18} color="#3b82f6" />
                <Text style={styles.instructionsText}>{selectedAction?.proofDescription}</Text>
              </View>

              <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
                {proofImage ? (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: proofImage }} style={styles.proofPreview} />
                    <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage}>
                      <Ionicons name="sync" size={16} color={colors.textPrimary} />
                      <Text style={styles.changePhotoText}>Changer la photo</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="cloud-upload" size={40} color={colors.accent} />
                    <Text style={styles.uploadPlaceholderText}>Cliquez pour télécharger une photo</Text>
                    <Text style={styles.uploadPlaceholderSubtext}>ou glissez-déposez une image ici</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.modalInfo}>
                <Ionicons name="information-circle" size={14} color="#f59e0b" />
                <Text style={styles.modalInfoText}>
                  Votre demande sera vérifiée par un administrateur avant validation
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowUploadModal(false)}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, !proofImage && styles.submitBtnDisabled]}
                onPress={submitActionWithProof}
                disabled={!proofImage}
              >
                <Ionicons name="paper-plane" size={16} color="#fff" />
                <Text style={styles.submitBtnText}>Soumettre</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  checklistWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  checklistSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.4)',
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fb923c',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    width: '48%',
    marginBottom: 10,
  },
  actionItemLeft: {
  },
  actionItemSubmitted: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(42, 157, 111, 0.1)',
  },
  actionCheckbox: {
    marginRight: 0,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 14,
  },
  actionPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionPointsText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  validationBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    width: 24,
    height: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  validationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#f59e0b',
  },
  progressCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  progressCircleContainer: {
    marginBottom: 20,
  },
  progressCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(42, 157, 111, 0.1)',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressDetails: {
    flexDirection: 'row',
    gap: 40,
  },
  progressStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  transportSection: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ef4444',
  },
  trackingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
  },
  marginTop: {
    marginTop: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationDetails: {
    flex: 1,
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  locationCoords: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  positionStats: {
    flexDirection: 'row',
    gap: 12,
  },
  positionStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 12,
    borderRadius: 8,
  },
  positionValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  positionLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  tripStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  tripStat: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tripStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripStatValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tripStatLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  ecoSavings: {
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  savingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savingText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a2332',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(42, 157, 111, 0.3)',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(42, 157, 111, 0.08)',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 20,
  },
  actionInfo: {
    backgroundColor: 'rgba(42, 157, 111, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(42, 157, 111, 0.25)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  actionInfoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  actionInfoPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionInfoPointsText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  proofInstructions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  uploadArea: {
    minHeight: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(42, 157, 111, 0.4)',
    borderRadius: 12,
    backgroundColor: 'rgba(42, 157, 111, 0.05)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  uploadPlaceholderText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 12,
  },
  uploadPlaceholderSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  previewContainer: {
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  proofPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 10,
  },
  modalInfoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: 'rgba(42, 157, 111, 0.5)',
    borderRadius: 10,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
