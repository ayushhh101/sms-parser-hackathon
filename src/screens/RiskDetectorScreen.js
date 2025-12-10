import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '../utils/apiConfig';

const { width } = Dimensions.get('window');

// Colors matching the design
const C = {
  bg: '#0f0f1a',
  card: '#1a1a2e',
  cardLight: '#2d2d44',
  purple: '#6c5ce7',
  green: '#00b894',
  red: '#ff7675',
  redDark: '#d63031',
  yellow: '#fdcb6e',
  orange: '#ff9f43',
  white: '#fff',
  gray: '#888',
  grayLight: '#b2b2b2',
  darkRed: '#4a1f1f',
  darkYellow: '#4a3f1f',
  darkGreen: '#1f4a2e',
};

const RiskDetectorScreen = () => {
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRiskAnalysis();
  }, []);

  const fetchRiskAnalysis = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/risks/analysis-history/usr_rahul_001?limit=1`;
      console.log('Fetching risk data from:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 100)}`);
      }
      
      // Get response text first
      const responseText = await response.text();
      console.log('Response text (first 200 chars):', responseText.substring(0, 200));
      
      // Try to parse as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('JSON parse error. Response:', responseText);
        throw new Error('Server returned invalid JSON. Make sure backend is running correctly.');
      }
      
      if (result.success && result.data.history && result.data.history.length > 0) {
        // Get the latest analysis from history
        setRiskData(result.data.history[0]);
        setError(null);
      } else {
        setError(result.error || 'No risk analysis data found');
      }
    } catch (err) {
      const errorMessage = err.message || 'Unable to connect to server';
      setError(errorMessage);
      console.error('Risk fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = () => {
    if (!riskData) return 'Low';
    
    const highRisks = riskData.three_predicted_risks?.filter(r => r.riskLevel === 'high').length || 0;
    const mediumRisks = riskData.three_predicted_risks?.filter(r => r.riskLevel === 'medium').length || 0;
    
    if (highRisks >= 2) return 'High';
    if (highRisks >= 1 || mediumRisks >= 2) return 'Medium';
    return 'Low';
  };

  const getRiskColor = (level) => {
    switch (level.toLowerCase()) {
      case 'high': return C.red;
      case 'medium': return C.orange;
      default: return C.green;
    }
  };

  const getRisksDetectedThisWeek = () => {
    if (!riskData) return 0;
    return riskData.three_predicted_risks?.length || 0;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={C.purple} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={C.red} />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorDebug}>
            Trying to connect to:{'\n'}
            {API_BASE_URL}/risks/analysis-history/usr_rahul_001?limit=1
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRiskAnalysis}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
          <Text style={styles.errorHint}>
            Make sure:{'\n'}
            • Backend server is running{'\n'}
            • IP address is correct (check ipconfig){'\n'}
            • Route /api/risks/analysis-history/:userId exists{'\n'}
            • Database has risk analysis data
          </Text>
        </View>
      </View>
    );
  }

  const currentRiskLevel = getRiskLevel();
  const risksDetected = getRisksDetectedThisWeek();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomWidth: 1, borderBottomColor: '#2d2d44', paddingVertical: 12 }]}>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Risk Detector</Text>
          <Text style={styles.headerSubtitle}>Proactive spending alerts</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Risk Level Card */}
        <View style={styles.riskLevelCard}>
          <Text style={styles.riskLevelTitle}>Current Risk Level</Text>
          <View style={styles.riskCircleContainer}>
            <View style={styles.riskCircle}>
              <View style={[styles.riskArc, { borderColor: C.gray }]} />
              <View style={[styles.riskArc, styles.riskArcActive, { borderTopColor: getRiskColor(currentRiskLevel), borderRightColor: getRiskColor(currentRiskLevel) }]} />
              <Text style={[styles.riskLevelText, { color: getRiskColor(currentRiskLevel) }]}>
                {currentRiskLevel}
              </Text>
            </View>
          </View>
          <Text style={styles.risksDetectedText}>
            {risksDetected} risks detected this week
          </Text>
        </View>

        {/* Active Risks Section */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="alert-outline" size={24} color={C.red} />
          <Text style={styles.sectionTitle}>Active Risks</Text>
        </View>

        {/* High Risk Card */}
        {riskData?.high_risk_head && (
          <View style={[styles.riskCard, styles.highRiskCard]}>
            <View style={styles.riskCardHeader}>
              <View style={styles.riskIconContainer}>
                <Ionicons name="alert-circle" size={32} color={C.red} />
              </View>
              <View style={styles.riskCardHeaderText}>
                <Text style={styles.riskType}>High Risk</Text>
                <Text style={styles.riskTitle}>{riskData.high_risk_head}</Text>
                <Text style={styles.riskDescription}>{riskData.high_risk_description}</Text>
              </View>
              <View style={styles.riskBadge}>
                <Text style={styles.riskBadgeText}>Critical</Text>
              </View>
            </View>

            {/* Progress Bars */}
            <View style={styles.progressSection}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Normal</Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, styles.normalBar, { width: '75%' }]} />
                </View>
                <Text style={styles.progressValue}>₹{riskData.normal_spending_rupees?.toFixed(0)}</Text>
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Current</Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, styles.currentBar, { width: '85%' }]} />
                </View>
                <Text style={styles.progressValue}>₹{riskData.current_spending_rupees?.toFixed(0)}</Text>
              </View>
            </View>

            {/* Suggestion */}
            <View style={styles.suggestionBox}>
              <Ionicons name="bulb" size={16} color={C.yellow} />
              <Text style={styles.suggestionLabel}>Suggestion:</Text>
              <Text style={styles.suggestionText}>
                Reduce spending by ₹{(riskData.current_spending_rupees - riskData.normal_spending_rupees).toFixed(0)} to normalize
              </Text>
            </View>
          </View>
        )}

        {/* Medium Risk Card */}
        {riskData?.medium_risk_head && (
          <View style={[styles.riskCard, styles.mediumRiskCard]}>
            <View style={styles.riskCardHeader}>
              <View style={styles.riskIconContainer}>
                <MaterialCommunityIcons name="trending-down" size={32} color={C.orange} />
              </View>
              <View style={styles.riskCardHeaderText}>
                <Text style={styles.riskType}>Medium Risk</Text>
                <Text style={styles.riskTitle}>{riskData.medium_risk_head}</Text>
                <Text style={styles.riskDescription}>{riskData.medium_risk_description}</Text>
              </View>
              <View style={[styles.riskBadge, styles.warningBadge]}>
                <Text style={styles.riskBadgeText}>Warning</Text>
              </View>
            </View>

            {/* Balance Projection */}
            {riskData?.balance_today_rupees && (
              <View style={styles.balanceProjection}>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceDay}>Today</Text>
                  <Text style={styles.balanceAmount}>₹{riskData.balance_today_rupees.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceDay}>+2 days</Text>
                  <Text style={[styles.balanceAmount, { color: C.orange }]}>
                    ₹{riskData.balance_plus_2days_rupees.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceDay}>+4 days</Text>
                  <Text style={[styles.balanceAmount, { color: C.red }]}>
                    ₹{riskData.balance_plus_4days_rupees.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Pattern Detected Card */}
        {riskData?.pattern_detected_head && (
          <View style={[styles.riskCard, styles.patternCard]}>
            <View style={styles.riskCardHeader}>
              <View style={styles.riskIconContainer}>
                <Ionicons name="eye" size={32} color={C.yellow} />
              </View>
              <View style={styles.riskCardHeaderText}>
                <Text style={styles.riskType}>Pattern Detected</Text>
                <Text style={styles.riskTitle}>{riskData.pattern_detected_head}</Text>
                <Text style={styles.riskDescription}>{riskData.pattern_detected_description}</Text>
              </View>
              <View style={[styles.riskBadge, styles.infoBadge]}>
                <Text style={styles.riskBadgeText}>Info</Text>
              </View>
            </View>

            {/* Weekly Pattern */}
            <View style={styles.weeklyPattern}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <View key={day} style={styles.dayContainer}>
                  <View
                    style={[
                      styles.dayBar,
                      day === riskData.highest_spending_day?.substring(0, 3) && styles.dayBarActive,
                    ]}
                  />
                  <Text style={styles.dayLabel}>{day}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Predicted Risks Ahead */}
        <View style={styles.sectionHeader}>
          <Ionicons name="flash" size={24} color={C.purple} />
          <Text style={styles.sectionTitle}>Predicted Risks Ahead</Text>
        </View>

        {riskData?.three_predicted_risks?.map((risk, index) => (
          <View key={index} style={styles.predictedRiskCard}>
            <View style={styles.predictedRiskHeader}>
              <View style={styles.predictedRiskIcon}>
                {risk.riskLevel === 'high' ? (
                  <MaterialCommunityIcons name="chart-line-variant" size={24} color={C.red} />
                ) : risk.title.includes('Festival') ? (
                  <MaterialCommunityIcons name="party-popper" size={24} color={C.orange} />
                ) : (
                  <MaterialCommunityIcons name="credit-card" size={24} color={C.orange} />
                )}
              </View>
              <View style={styles.predictedRiskText}>
                <Text style={styles.predictedRiskTitle}>{risk.title}</Text>
                <Text style={styles.predictedRiskDescription}>{risk.description}</Text>
              </View>
              <Text style={[styles.riskLevelBadge, { color: risk.riskLevel === 'high' ? C.red : C.orange }]}>
                {risk.riskLevel === 'high' ? 'High' : 'High'}
              </Text>
            </View>
          </View>
        ))}

        {/* Smart Nudges Active */}
        <View style={styles.smartNudgesCard}>
          <View style={styles.smartNudgesHeader}>
            <Ionicons name="notifications" size={24} color={C.green} />
            <Text style={styles.smartNudgesTitle}>Smart Nudges Active</Text>
          </View>
          <Text style={styles.smartNudgesSubtitle}>
            You'll get alerts before problems happen, not after!
          </Text>

          <View style={styles.nudgesList}>
            <View style={styles.nudgeItem}>
              <Text style={styles.nudgeLabel}>Overspending alerts</Text>
              <View style={styles.nudgeStatus}>
                <Ionicons name="checkmark" size={16} color={C.green} />
                <Text style={styles.nudgeStatusText}>On</Text>
              </View>
            </View>
            <View style={styles.nudgeItem}>
              <Text style={styles.nudgeLabel}>Low balance warnings</Text>
              <View style={styles.nudgeStatus}>
                <Ionicons name="checkmark" size={16} color={C.green} />
                <Text style={styles.nudgeStatusText}>On</Text>
              </View>
            </View>
            <View style={styles.nudgeItem}>
              <Text style={styles.nudgeLabel}>Pattern notifications</Text>
              <View style={styles.nudgeStatus}>
                <Ionicons name="checkmark" size={16} color={C.green} />
                <Text style={styles.nudgeStatusText}>On</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  // backButton: {
  //   marginRight: 15,
  // },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: C.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: C.gray,
    marginTop: 2,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  riskLevelCard: {
    backgroundColor: C.darkRed,
    borderRadius: 20,
    padding: 30,
    marginBottom: 25,
    marginTop: 20,
    alignItems: 'center',
  },
  riskLevelTitle: {
    fontSize: 16,
    color: C.grayLight,
    marginBottom: 20,
  },
  riskCircleContainer: {
    marginVertical: 20,
  },
  riskCircle: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  riskArc: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 20,
    borderColor: 'transparent',
  },
  riskArcActive: {
    borderTopColor: C.orange,
    borderRightColor: C.orange,
    borderBottomColor: C.yellow,
    borderLeftColor: C.gray,
    transform: [{ rotate: '45deg' }],
  },
  riskLevelText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  risksDetectedText: {
    fontSize: 14,
    color: C.grayLight,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: C.white,
    marginLeft: 10,
  },
  riskCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  highRiskCard: {
    backgroundColor: C.darkRed,
  },
  mediumRiskCard: {
    backgroundColor: C.darkYellow,
  },
  patternCard: {
    backgroundColor: '#3a3520',
  },
  riskCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  riskIconContainer: {
    marginRight: 12,
  },
  riskCardHeaderText: {
    flex: 1,
  },
  riskType: {
    fontSize: 12,
    color: C.grayLight,
    marginBottom: 4,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: C.white,
    marginBottom: 4,
  },
  riskDescription: {
    fontSize: 13,
    color: C.grayLight,
  },
  riskBadge: {
    backgroundColor: C.redDark,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  warningBadge: {
    backgroundColor: '#6b4e1f',
  },
  infoBadge: {
    backgroundColor: '#4a4520',
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: C.white,
  },
  progressSection: {
    marginVertical: 15,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 13,
    color: C.grayLight,
    width: 60,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  normalBar: {
    backgroundColor: C.gray,
  },
  currentBar: {
    backgroundColor: C.red,
  },
  progressValue: {
    fontSize: 13,
    color: C.white,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'right',
  },
  suggestionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
  },
  suggestionLabel: {
    fontSize: 13,
    color: C.yellow,
    fontWeight: 'bold',
    marginLeft: 6,
    marginRight: 6,
  },
  suggestionText: {
    flex: 1,
    fontSize: 12,
    color: C.white,
  },
  balanceProjection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceDay: {
    fontSize: 12,
    color: C.grayLight,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: C.white,
  },
  weeklyPattern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayBar: {
    width: 35,
    height: 35,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    marginBottom: 6,
  },
  dayBarActive: {
    backgroundColor: C.yellow,
  },
  dayLabel: {
    fontSize: 11,
    color: C.grayLight,
  },
  predictedRiskCard: {
    backgroundColor: C.card,
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
  },
  predictedRiskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  predictedRiskIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  predictedRiskText: {
    flex: 1,
  },
  predictedRiskTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: C.white,
    marginBottom: 4,
  },
  predictedRiskDescription: {
    fontSize: 12,
    color: C.grayLight,
    lineHeight: 18,
  },
  riskLevelBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  smartNudgesCard: {
    backgroundColor: C.darkGreen,
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
  },
  smartNudgesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  smartNudgesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: C.white,
    marginLeft: 10,
  },
  smartNudgesSubtitle: {
    fontSize: 13,
    color: C.grayLight,
    marginBottom: 20,
  },
  nudgesList: {
    gap: 15,
  },
  nudgeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nudgeLabel: {
    fontSize: 14,
    color: C.white,
  },
  nudgeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nudgeStatusText: {
    fontSize: 13,
    color: C.green,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  errorText: {
    color: C.red,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorDebug: {
    color: C.gray,
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: 'monospace',
  },
  errorHint: {
    color: C.grayLight,
    fontSize: 12,
    textAlign: 'left',
    marginTop: 20,
    padding: 15,
    backgroundColor: C.card,
    borderRadius: 10,
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: C.purple,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  retryText: {
    color: C.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RiskDetectorScreen;
