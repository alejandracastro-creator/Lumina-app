import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, FlatList, Dimensions, Alert } from 'react-native';
import LuminaBackground from '../../components/LuminaBackground';
import { RITUAL_DATA, REVIEW_MODE } from '../../constants/Data';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BreathingGuide from '../../components/BreathingGuide';
import InfoButton from '../../components/InfoButton';

const { width } = Dimensions.get('window');

type RitualSession = 'morning' | 'night';

type RitualProgress = {
  day: number;
  morningCompleted: boolean;
  nightCompleted: boolean;
  lastCompletedDate: string | null;
};

type RitualStep =
  | { type: 'info'; text: string }
  | { type: 'input'; text: string }
  | { type: 'number'; text: string }
  | { type: 'choice'; text: string; options: string[] }
  | { type: 'breathing'; text: string; inhale: number; hold: number; exhale: number; hold2: number; repeat?: number };

type DayEntrySession = {
  answers: string[];
  lockedCount: number;
  completed: boolean;
};

type DayEntry = {
  morning: DayEntrySession;
  night: DayEntrySession;
};

const PROGRESS_KEY = 'lumina_ritual_progress_v2';
const ENTRIES_KEY = 'lumina_ritual_entries_v1';
const START_DATE_KEY = 'lumina_ritual_start_date';

const EMOTIONS = ['Alegría', 'Calma', 'Ansiedad', 'Confianza', 'Tristeza', 'Furia', 'Miedo', 'Gratitud'];

function ensureDayEntry(existing?: DayEntry): DayEntry {
  return (
    existing ?? {
      morning: { answers: [], lockedCount: 0, completed: false },
      night: { answers: [], lockedCount: 0, completed: false },
    }
  );
}

export default function RitualScreen() {
  const [progress, setProgress] = useState<RitualProgress[]>([]);
  const [entries, setEntries] = useState<Record<number, DayEntry>>({});
  const [startDate, setStartDate] = useState<string | null>(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);
  const [view, setView] = useState<'grid' | 'detail' | 'session'>('grid');
  const [currentSession, setCurrentSession] = useState<RitualSession | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [draft, setDraft] = useState('');

  const selectedDayData = useMemo(() => {
    if (!selectedDayNumber) return null;
    return RITUAL_DATA.find((d: any) => d.day === selectedDayNumber) ?? null;
  }, [selectedDayNumber]);

  const loadAll = useCallback(async () => {
    try {
      const [savedProgress, savedEntries] = await Promise.all([
        AsyncStorage.getItem(PROGRESS_KEY),
        AsyncStorage.getItem(ENTRIES_KEY),
      ]);

      let currentProgress: RitualProgress[] = [];
      if (savedProgress) {
        currentProgress = JSON.parse(savedProgress);
      } else {
        currentProgress = RITUAL_DATA.map((d: any) => ({
          day: d.day,
          morningCompleted: false,
          nightCompleted: false,
          lastCompletedDate: null,
        }));
      }

      const parsedEntries: Record<number, DayEntry> = savedEntries ? JSON.parse(savedEntries) : {};
      const normalized: Record<number, DayEntry> = {};
      for (const d of RITUAL_DATA as any[]) {
        normalized[d.day] = ensureDayEntry(parsedEntries[d.day]);
      }

      setProgress(currentProgress);
      setEntries(normalized);

      if (!REVIEW_MODE) {
        const savedStartDate = await AsyncStorage.getItem(START_DATE_KEY);
        const todayStr = new Date().toISOString().split('T')[0];
        const nextStartDate = savedStartDate || todayStr;
        setStartDate(nextStartDate);
        if (!savedStartDate) {
          await AsyncStorage.setItem(START_DATE_KEY, nextStartDate);
        }
      } else {
        setStartDate(null);
      }

      await Promise.all([
        AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(currentProgress)),
        AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(normalized)),
      ]);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const getStepsFor = useCallback((dayData: any, session: RitualSession): RitualStep[] => {
    const base = (dayData?.[session] ?? []) as RitualStep[];
    if (session === 'morning') {
      return [{ type: 'number', text: '¿Cuántas horas dormiste?' }, ...base];
    }
    return [{ type: 'choice', text: '¿Qué emoción predominó hoy?', options: EMOTIONS }, ...base];
  }, []);

  const currentDayNumber = useMemo(() => {
    if (REVIEW_MODE || !startDate) return null;
    const todayStr = new Date().toISOString().split('T')[0];
    const diffMs = Date.parse(todayStr) - Date.parse(startDate);
    const diffDays = Math.floor(diffMs / 86400000);
    const n = diffDays + 1;
    if (n < 1) return 1;
    if (n > 30) return 30;
    return n;
  }, [startDate]);

  const getDayStatus = useCallback(
    (day: number) => {
      const dayProgress = progress.find(p => p.day === day);
      if (!dayProgress) return REVIEW_MODE ? 'available' : 'locked';

      if (REVIEW_MODE) {
        if (dayProgress.morningCompleted && dayProgress.nightCompleted) return 'completed';
        if (dayProgress.morningCompleted && !dayProgress.nightCompleted) return 'partial';
        return 'available';
      }

      if (!currentDayNumber) return 'locked';

      if (dayProgress.morningCompleted && dayProgress.nightCompleted) return 'completed';

      if (day < currentDayNumber) return 'missed';
      if (day > currentDayNumber) return 'locked';

      if (dayProgress.morningCompleted && !dayProgress.nightCompleted) return 'partial';
      return 'available';
    },
    [currentDayNumber, progress]
  );

  const openDayDetail = useCallback(
    (dayNumber: number) => {
      setSelectedDayNumber(dayNumber);
      setView('detail');
      setCurrentSession(null);
      setCurrentStepIndex(0);
      setDraft('');
    },
    []
  );

  const startOrResumeSession = useCallback(
    (session: RitualSession) => {
      if (!selectedDayData || !selectedDayNumber) return;

      const dayProgress = progress.find(p => p.day === selectedDayNumber);
      if (!REVIEW_MODE) {
        if (session === 'night' && !dayProgress?.morningCompleted) {
          Alert.alert('Primero Mañana', 'Completa la sesión de la mañana antes de la noche.');
          return;
        }
      }

      const dayEntry = ensureDayEntry(entries[selectedDayNumber]);
      const sessionEntry = dayEntry[session];
      const steps = getStepsFor(selectedDayData, session);
      const idx = Math.min(sessionEntry.lockedCount, Math.max(steps.length - 1, 0));

      setCurrentSession(session);
      setCurrentStepIndex(idx);
      setDraft(sessionEntry.answers[idx] ?? '');
      setView('session');
    },
    [entries, getStepsFor, progress, selectedDayData, selectedDayNumber]
  );

  const persistEntries = useCallback(async (nextEntries: Record<number, DayEntry>) => {
    setEntries(nextEntries);
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(nextEntries));
  }, []);

  const persistProgress = useCallback(async (nextProgress: RitualProgress[]) => {
    setProgress(nextProgress);
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(nextProgress));
  }, []);

  const commitCurrentStep = useCallback(async () => {
    if (!selectedDayData || !selectedDayNumber || !currentSession) return;

    const steps = getStepsFor(selectedDayData, currentSession);
    const step = steps[currentStepIndex];

    const nextEntries = { ...entries };
    const dayEntry = ensureDayEntry(nextEntries[selectedDayNumber]);
    const sessionEntry = { ...dayEntry[currentSession] };
    const nextAnswers = [...sessionEntry.answers];

    if (step.type === 'input' || step.type === 'number' || step.type === 'choice') {
      nextAnswers[currentStepIndex] = draft;
    }

    const nextLockedCount = Math.max(sessionEntry.lockedCount, currentStepIndex + 1);
    const isSessionCompleted = nextLockedCount >= steps.length;

    const updatedSessionEntry: DayEntrySession = {
      answers: nextAnswers,
      lockedCount: nextLockedCount,
      completed: isSessionCompleted ? true : sessionEntry.completed,
    };

    const updatedDayEntry: DayEntry = {
      ...dayEntry,
      [currentSession]: updatedSessionEntry,
    };

    nextEntries[selectedDayNumber] = updatedDayEntry;
    await persistEntries(nextEntries);

    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setDraft(updatedSessionEntry.answers[nextIndex] ?? '');
      return;
    }

    const nextProgress = [...progress];
    const dayIdx = nextProgress.findIndex(p => p.day === selectedDayNumber);
    const today = new Date().toISOString().split('T')[0];

    if (dayIdx >= 0) {
      if (currentSession === 'morning') {
        nextProgress[dayIdx] = { ...nextProgress[dayIdx], morningCompleted: true };
      } else {
        nextProgress[dayIdx] = { ...nextProgress[dayIdx], nightCompleted: true, lastCompletedDate: today };
      }
      await persistProgress(nextProgress);
    }

    if (!REVIEW_MODE && currentSession === 'night') {
      const lastDate = await AsyncStorage.getItem('lumina_ritual_last_date');
      const currentStreak = await AsyncStorage.getItem('lumina_ritual_streak');
      let newStreak = parseInt(currentStreak || '0');
      if (lastDate !== today) {
        newStreak += 1;
        await AsyncStorage.setItem('lumina_ritual_streak', newStreak.toString());
        await AsyncStorage.setItem('lumina_ritual_last_date', today);
        await AsyncStorage.setItem('oracle_streak', newStreak.toString());
      }
    }

    setSelectedDayNumber(null);
    setView('grid');
    setCurrentSession(null);
    setCurrentStepIndex(0);
    setDraft('');
  }, [currentSession, currentStepIndex, draft, entries, getStepsFor, persistEntries, persistProgress, progress, selectedDayData, selectedDayNumber]);

  const renderGrid = () => (
    <LuminaBackground style={styles.container}>
      <InfoButton
        title="Ritual"
        text="El Ritual se completa en dos momentos: mañana y noche. Podés avanzar a tu ritmo y volver a tus respuestas cuando quieras. Es un espacio para acompañarte, no para exigirte."
        top={56}
        right={16}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ritual de 30 Días</Text>
        <Text style={styles.headerSubtitle}>Sigue el camino, un día a la vez.</Text>
      </View>

      <FlatList
        data={RITUAL_DATA as any[]}
        keyExtractor={(item) => item.day.toString()}
        numColumns={4}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item }) => {
          const status = getDayStatus(item.day);
          return (
            <TouchableOpacity
              style={[
                styles.dayButton,
                status === 'completed' && styles.dayButtonCompleted,
                status === 'locked' && styles.dayButtonLocked,
                status === 'missed' && styles.dayButtonMissed,
                status === 'partial' && styles.dayButtonPartial,
              ]}
              onPress={() => {
                if (!REVIEW_MODE && status === 'locked') {
                  Alert.alert('Día Bloqueado', 'Este día todavía no está disponible.');
                  return;
                }
                if (!REVIEW_MODE && status === 'missed') {
                  Alert.alert('Día omitido', 'Este día ya pasó y no se puede completar.');
                  return;
                }
                openDayDetail(item.day);
              }}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  status === 'completed' && styles.dayButtonTextCompleted,
                  status === 'locked' && styles.dayButtonTextLocked,
                  status === 'missed' && styles.dayButtonTextMissed,
                ]}
              >
                {item.day}
              </Text>
              {status === 'completed' && (
                <Ionicons name="checkmark-circle" size={14} color="#10B981" style={styles.checkIcon} />
              )}
              {status === 'partial' && (
                <Ionicons name="moon" size={14} color="#F472B6" style={styles.partialIcon} />
              )}
              {status === 'missed' && (
                <Ionicons name="close-circle" size={14} color="#EF4444" style={styles.missedIcon} />
              )}
              {!REVIEW_MODE && status === 'locked' && (
                <Ionicons name="lock-closed" size={14} color="rgba(255,255,255,0.2)" style={styles.lockIcon} />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </LuminaBackground>
  );

  const renderDetail = () => {
    if (!selectedDayData || !selectedDayNumber) return null;

    const dayEntry = ensureDayEntry(entries[selectedDayNumber]);
    const dayProgress = progress.find(p => p.day === selectedDayNumber);
    const status = getDayStatus(selectedDayNumber);

    const morningSteps = getStepsFor(selectedDayData, 'morning');
    const nightSteps = getStepsFor(selectedDayData, 'night');

    return (
      <LuminaBackground style={styles.container}>
        <ScrollView contentContainerStyle={styles.detailContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => setView('grid')}>
            <Ionicons name="chevron-back" size={28} color="#C4B5FD" />
          </TouchableOpacity>

          <View style={styles.stepIndicator}>
            <Text style={styles.dayIndicatorText}>DÍA {selectedDayNumber}</Text>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailButtonsRow}>
              {status === 'completed' ? (
                <TouchableOpacity style={styles.detailButton} onPress={() => setView('grid')}>
                  <Text style={styles.detailButtonText}>VOLVER AL CALENDARIO</Text>
                </TouchableOpacity>
              ) : (
                <>
                  {(REVIEW_MODE || status === 'available') && (
                    <TouchableOpacity style={styles.detailButton} onPress={() => startOrResumeSession('morning')}>
                      <Text style={styles.detailButtonText}>COMENZAR CON LA MAÑANA</Text>
                    </TouchableOpacity>
                  )}
                  {(REVIEW_MODE || status === 'partial') && (
                    <TouchableOpacity style={styles.detailButtonAlt} onPress={() => startOrResumeSession('night')}>
                      <Text style={styles.detailButtonAltText}>CONTINUAR CON LA NOCHE</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            <Text style={styles.detailSectionTitle}>🌅 MAÑANA</Text>
            {morningSteps.map((s, idx) => {
              const answer = dayEntry.morning.answers[idx];
              const showAnswer =
                s.type === 'breathing' || s.type === 'info'
                  ? idx < dayEntry.morning.lockedCount
                    ? 'Hecho'
                    : 'Pendiente'
                  : answer
                  ? answer
                  : '—';
              return (
                <View key={`m-${idx}`} style={styles.qaRow}>
                  <Text style={styles.qaQuestion}>{s.text}</Text>
                  <Text style={styles.qaAnswer}>{showAnswer}</Text>
                </View>
              );
            })}

            <View style={styles.detailDivider} />

            <Text style={styles.detailSectionTitle}>🌙 NOCHE</Text>
            {nightSteps.map((s, idx) => {
              const answer = dayEntry.night.answers[idx];
              const showAnswer =
                s.type === 'breathing' || s.type === 'info'
                  ? idx < dayEntry.night.lockedCount
                    ? 'Hecho'
                    : 'Pendiente'
                  : answer
                  ? answer
                  : '—';
              return (
                <View key={`n-${idx}`} style={styles.qaRow}>
                  <Text style={styles.qaQuestion}>{s.text}</Text>
                  <Text style={styles.qaAnswer}>{showAnswer}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </LuminaBackground>
    );
  };

  const renderSession = () => {
    if (!selectedDayData || !selectedDayNumber || !currentSession) return null;

    const steps = getStepsFor(selectedDayData, currentSession);
    const step = steps[currentStepIndex];

    const disableContinue = step.type === 'choice' && (draft ?? '').trim().length === 0;

    return (
      <LuminaBackground style={styles.container}>
        <ScrollView contentContainerStyle={styles.sessionContent}>
          <View style={styles.sessionTopRow}>
            <TouchableOpacity
              style={styles.sessionTopButton}
              onPress={() => {
                if (currentStepIndex > 0) {
                  const prev = currentStepIndex - 1;
                  const dayEntry = ensureDayEntry(entries[selectedDayNumber]);
                  const sessionEntry = dayEntry[currentSession];
                  setCurrentStepIndex(prev);
                  setDraft(sessionEntry.answers[prev] ?? '');
                  return;
                }
                setView('detail');
                setCurrentSession(null);
                setCurrentStepIndex(0);
                setDraft('');
              }}
            >
              <Ionicons name="chevron-back" size={28} color="#C4B5FD" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sessionTopButton}
              onPress={() => {
                setView('detail');
                setCurrentSession(null);
                setCurrentStepIndex(0);
                setDraft('');
              }}
            >
              <Ionicons name="close" size={26} color="#C4B5FD" />
            </TouchableOpacity>
          </View>

          <View style={styles.stepIndicator}>
            <Text style={styles.dayIndicatorText}>
              DÍA {selectedDayNumber} - {currentSession === 'morning' ? '🌅 MAÑANA' : '🌙 NOCHE'}
            </Text>
            <View style={styles.progressDots}>
              {steps.map((_, i) => (
                <View key={i} style={[styles.dot, i === currentStepIndex && styles.dotActive]} />
              ))}
            </View>
          </View>

          <View style={styles.card}>
            {step.type === 'info' && <Text style={styles.infoText}>{step.text}</Text>}

            {step.type === 'breathing' && (
              <View style={styles.breathingContainer}>
                <Text style={styles.breathingTitle}>{step.text}</Text>
                <BreathingGuide
                  inhale={step.inhale}
                  hold={step.hold}
                  exhale={step.exhale}
                  hold2={step.hold2}
                  repeat={step.repeat}
                />
              </View>
            )}

            {step.type === 'choice' && (
              <>
                <Text style={styles.promptText}>{step.text}</Text>
                <View style={styles.choiceGrid}>
                  {step.options.map((opt) => {
                    const active = draft === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        style={[styles.choiceChip, active && styles.choiceChipActive]}
                        onPress={() => setDraft(opt)}
                      >
                        <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {(step.type === 'input' || step.type === 'number') && (
              <>
                <Text style={styles.promptText}>{step.text}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={step.type === 'number' ? 'Ej: 7' : 'Tu respuesta...'}
                  placeholderTextColor="rgba(196, 181, 253, 0.4)"
                  multiline={step.type !== 'number'}
                  keyboardType={step.type === 'number' ? 'numeric' : 'default'}
                  value={draft}
                  onChangeText={setDraft}
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.nextButton, disableContinue && styles.nextButtonDisabled]}
              onPress={commitCurrentStep}
              disabled={disableContinue}
            >
              <Text style={styles.nextButtonText}>
                {currentStepIndex === steps.length - 1
                  ? currentSession === 'morning'
                    ? 'FINALIZAR MAÑANA'
                    : 'FINALIZADO NOCHE'
                  : 'CONTINUAR'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LuminaBackground>
    );
  };

  if (view === 'grid') return renderGrid();
  if (view === 'detail') return renderDetail();
  return renderSession();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 25,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E9D5FF',
    fontFamily: 'System',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#C4B5FD',
    marginTop: 5,
  },
  gridContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dayButton: {
    width: (width - 70) / 4,
    aspectRatio: 1,
    margin: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  dayButtonCompleted: {
    backgroundColor: '#10B981', // Verde sólido
    borderColor: '#059669',
  },
  dayButtonPartial: {
    borderColor: 'rgba(244, 114, 182, 0.7)',
  },
  dayButtonMissed: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.8)',
  },
  dayButtonLocked: {
    opacity: 0.3,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dayButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E9D5FF',
  },
  dayButtonTextCompleted: {
    color: '#FFF', // Texto blanco sobre verde
  },
  dayButtonTextLocked: {
    color: 'rgba(255,255,255,0.2)',
  },
  dayButtonTextMissed: {
    color: '#FCA5A5',
  },
  checkIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  partialIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  missedIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  lockIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
  },
  sessionContent: {
    padding: 20,
    paddingTop: 14,
  },
  backButton: {
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  sessionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionTopButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  stepIndicator: {
    marginBottom: 22,
    alignItems: 'center',
  },
  dayIndicatorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A78BFA',
    marginBottom: 10,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
  },
  dotActive: {
    backgroundColor: '#A78BFA',
    width: 20,
  },
  card: {
    backgroundColor: 'rgba(26, 16, 61, 0.7)',
    borderRadius: 30,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    minHeight: 400,
    justifyContent: 'space-between',
  },
  infoText: {
    fontSize: 22,
    color: '#E9D5FF',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '300',
  },
  promptText: {
    fontSize: 18,
    color: '#C4B5FD',
    marginBottom: 20,
    lineHeight: 26,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    color: '#FFF',
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choiceChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  choiceChipActive: {
    backgroundColor: 'rgba(244, 114, 182, 0.25)',
    borderColor: 'rgba(244, 114, 182, 0.75)',
  },
  choiceChipText: {
    color: '#E9D5FF',
    fontSize: 14,
    fontWeight: '600',
  },
  choiceChipTextActive: {
    color: '#FDE68A',
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  breathingTitle: {
    fontSize: 20,
    color: '#A78BFA',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#A78BFA',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#1A103D',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  detailContent: {
    padding: 20,
    paddingTop: 12,
  },
  detailCard: {
    backgroundColor: 'rgba(26, 16, 61, 0.7)',
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  detailSectionTitle: {
    color: '#E9D5FF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  qaRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(167, 139, 250, 0.18)',
  },
  qaQuestion: {
    color: '#C4B5FD',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  qaAnswer: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 22,
  },
  detailDivider: {
    height: 1,
    backgroundColor: 'rgba(167, 139, 250, 0.25)',
    marginVertical: 14,
  },
  detailButtonsRow: {
    marginTop: 10,
    gap: 10,
    marginBottom: 14,
  },
  detailButton: {
    backgroundColor: '#A78BFA',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#1A103D',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  detailButtonAlt: {
    backgroundColor: '#F472B6',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  detailButtonAltText: {
    color: '#1A103D',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
