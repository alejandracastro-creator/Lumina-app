import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Animated, KeyboardAvoidingView, Platform, Keyboard, findNodeHandle } from 'react-native';
import LuminaBackground from '../../components/LuminaBackground';
import { SOS_DATA, SOS_FINAL_MESSAGE } from '../../constants/Data';
import { Ionicons } from '@expo/vector-icons';
import BreathingGuide from '../../components/BreathingGuide';
import CounterGuide from '../../components/CounterGuide';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InfoButton from '../../components/InfoButton';

const SOS_USAGE_KEY = 'lumina_sos_usage_v1';
const BURN_DELAY_MS = 3000;
const BURN_ANIM_MS = 2000;

export default function SOSScreen() {
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const textRef = useRef('');
  const stepScrollRef = useRef<ScrollView | null>(null);
  const inputRef = useRef<TextInput | null>(null);
  const scrollInputIntoViewRef = useRef<(() => void) | null>(null);
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burnLoopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burnQueueRef = useRef<Array<{ key: string; start: number; end: number; dueAt: number }>>([]);
  const burnStateRef = useRef<Record<string, { status: 'scheduled' | 'burning' | 'burned'; dueAt?: number }>>({});
  const burnAnimRef = useRef<Record<string, Animated.Value>>({});
  const [burnVersion, setBurnVersion] = useState(0);

  const trackSosUse = async (categoryId: string) => {
    try {
      const raw = await AsyncStorage.getItem(SOS_USAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const today = new Date().toISOString().split('T')[0];

      const next = {
        total: typeof parsed.total === 'number' ? parsed.total : 0,
        byCategory: typeof parsed.byCategory === 'object' && parsed.byCategory ? parsed.byCategory : {},
        byDay: typeof parsed.byDay === 'object' && parsed.byDay ? parsed.byDay : {},
      } as any;

      next.total += 1;
      next.byCategory[categoryId] = (next.byCategory[categoryId] ?? 0) + 1;

      const dayEntry = next.byDay[today] ?? { total: 0, byCategory: {} };
      dayEntry.total = (dayEntry.total ?? 0) + 1;
      dayEntry.byCategory = dayEntry.byCategory ?? {};
      dayEntry.byCategory[categoryId] = (dayEntry.byCategory[categoryId] ?? 0) + 1;
      next.byDay[today] = dayEntry;

      await AsyncStorage.setItem(SOS_USAGE_KEY, JSON.stringify(next));
    } catch (e) {
      return;
    }
  };

  const handleNext = () => {
    if (currentStepIndex < selectedCategory.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setUserInput(''); // Borrar texto al pasar a la siguiente pantalla
    } else {
      setIsFinished(true);
    }
  };

  const resetBurnState = () => {
    burnQueueRef.current = [];
    burnStateRef.current = {};
    burnAnimRef.current = {};
    setBurnVersion((v) => v + 1);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (burnLoopTimerRef.current) {
      clearTimeout(burnLoopTimerRef.current);
      burnLoopTimerRef.current = null;
    }
  };

  const resetSOS = () => {
    setSelectedCategory(null);
    setCurrentStepIndex(0);
    setUserInput('');
    setIsFinished(false);
    textRef.current = '';
    resetBurnState();
  };

  useEffect(() => {
    textRef.current = '';
    resetBurnState();
  }, [currentStepIndex, selectedCategory?.id]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => scrollInputIntoViewRef.current?.(), 50);
    });
    return () => {
      show.remove();
    };
  }, []);

  const renderCategoryList = () => (
    <View style={styles.categoryContainer}>
      <Text style={styles.headerTitle}>S.O.S.</Text>
      <Text style={styles.headerSubtitle}>Elige lo que estás sintiendo ahora</Text>
      <View style={styles.grid}>
        {SOS_DATA.map((category) => (
          <TouchableOpacity 
            key={category.id} 
            style={[styles.categoryCard, { borderColor: category.color + '40' }]} 
            onPress={() => {
              trackSosUse(category.id);
              setSelectedCategory(category);
              setCurrentStepIndex(0);
              setUserInput('');
              setIsFinished(false);
            }}
          >
            <View style={[styles.iconCircle, { backgroundColor: category.color + '20' }]}>
              <Ionicons name={category.icon as any} size={40} color={category.color} />
            </View>
            <Text style={[styles.categoryTitle, { color: category.color }]}>{category.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep = () => {
    const step = selectedCategory.steps[currentStepIndex];
    const burnDelay = typeof step?.burnAfterIdleMs === 'number' ? step.burnAfterIdleMs : BURN_DELAY_MS;
    const isBurnStep = !!step?.burn && step.type === 'input' && selectedCategory?.id === 'furia';

    const scrollInputIntoView = () => {
      const scroll = stepScrollRef.current as any;
      const input = inputRef.current as any;
      if (!scroll || !input) return;

      const inputHandle = findNodeHandle(input);
      if (!inputHandle) {
        if (typeof scroll.scrollTo === 'function') scroll.scrollTo({ y: 0, animated: true });
        return;
      }

      const responder = typeof scroll.getScrollResponder === 'function' ? scroll.getScrollResponder() : scroll;
      if (typeof responder?.scrollResponderScrollNativeHandleToKeyboard === 'function') {
        responder.scrollResponderScrollNativeHandleToKeyboard(inputHandle, 90, true);
        return;
      }

      if (typeof scroll.scrollTo === 'function') scroll.scrollTo({ y: 0, animated: true });
    };
    scrollInputIntoViewRef.current = scrollInputIntoView;

    const isWhitespace = (ch: string) => ch === ' ' || ch === '\n' || ch === '\t';
    const makeKey = (start: number, end: number) => `${start}-${end}`;

    const getWordRangeBeforeCursor = (text: string, cursor: number) => {
      const pos = Math.max(0, Math.min(text.length, cursor));
      let i = pos - 1;
      while (i >= 0 && isWhitespace(text[i])) i -= 1;
      const end = i + 1;
      if (end <= 0) return null;
      while (i >= 0 && !isWhitespace(text[i])) i -= 1;
      const start = i + 1;
      if (end <= start) return null;
      const slice = text.slice(start, end);
      if (!slice.trim()) return null;
      return { start, end };
    };

    const ensureBurnLoop = () => {
      if (burnLoopTimerRef.current) {
        clearTimeout(burnLoopTimerRef.current);
        burnLoopTimerRef.current = null;
      }

      const state = burnStateRef.current;
      const queue = burnQueueRef.current;
      const anyBurning = Object.values(state).some((s) => s.status === 'burning');
      if (anyBurning) return;

      const now = Date.now();
      let nextIdx = -1;
      let nextDue = Infinity;
      for (let i = 0; i < queue.length; i++) {
        if (queue[i].dueAt < nextDue) {
          nextDue = queue[i].dueAt;
          nextIdx = i;
        }
      }
      if (nextIdx === -1) return;

      const wait = Math.max(0, nextDue - now);
      burnLoopTimerRef.current = setTimeout(() => {
        burnLoopTimerRef.current = null;
        const q = burnQueueRef.current;
        const st = burnStateRef.current;
        const now2 = Date.now();
        let idx2 = -1;
        let due2 = Infinity;
        for (let i = 0; i < q.length; i++) {
          if (q[i].dueAt <= now2 && q[i].dueAt < due2) {
            due2 = q[i].dueAt;
            idx2 = i;
          }
        }
        if (idx2 === -1) {
          ensureBurnLoop();
          return;
        }
        const job = q[idx2];
        const current = st[job.key];
        if (!current || current.status !== 'scheduled') {
          q.splice(idx2, 1);
          ensureBurnLoop();
          return;
        }

        st[job.key] = { status: 'burning' };
        setBurnVersion((v) => v + 1);
        const anim = new Animated.Value(0);
        burnAnimRef.current[job.key] = anim;

        Animated.timing(anim, {
          toValue: 1,
          duration: BURN_ANIM_MS,
          useNativeDriver: false,
        }).start(() => {
          burnStateRef.current[job.key] = { status: 'burned' };
          delete burnAnimRef.current[job.key];
          const q2 = burnQueueRef.current;
          const ix = q2.findIndex((x) => x.key === job.key);
          if (ix >= 0) q2.splice(ix, 1);
          setBurnVersion((v) => v + 1);
          ensureBurnLoop();
        });
      }, wait);
    };

    const scheduleBurn = (start: number, end: number, dueAt: number) => {
      const key = makeKey(start, end);
      const text = textRef.current;
      const slice = text.slice(start, end);
      if (!slice.trim()) return;

      const existing = burnStateRef.current[key];
      if (existing && existing.status !== 'burned') return;
      if (existing && existing.status === 'burned') return;

      burnStateRef.current[key] = { status: 'scheduled', dueAt };
      burnQueueRef.current.push({ key, start, end, dueAt });
      setBurnVersion((v) => v + 1);
      ensureBurnLoop();
    };

    const onBurnInputChange = (txt: string) => {
      if (!isBurnStep) {
        setUserInput(txt);
        textRef.current = txt;
        return;
      }

      const prev = textRef.current;
      const isAppend = txt.length >= prev.length && txt.startsWith(prev);
      if (!isAppend) {
        setUserInput(prev);
        const end = prev.length;
        const locked = { start: end, end };
        selectionRef.current = locked;
        setSelection(locked);
        return;
      }

      setUserInput(txt);
      textRef.current = txt;

      const added = txt.slice(prev.length);
      if (added) {
        for (let i = 0; i < added.length; i++) {
          const ch = added[i];
          if (ch !== ' ' && ch !== '\n' && ch !== '\t') continue;
          const prevChar = i === 0 ? prev[prev.length - 1] : added[i - 1];
          if (!prevChar || isWhitespace(prevChar)) continue;
          const boundaryIndex = prev.length + i;
          let s = boundaryIndex - 1;
          while (s >= 0 && !isWhitespace(txt[s])) s -= 1;
          s += 1;
          scheduleBurn(s, boundaryIndex, Date.now() + burnDelay);
        }
      }

      if (selectionRef.current.start > txt.length || selectionRef.current.end > txt.length) {
        const nextSel = { start: txt.length, end: txt.length };
        selectionRef.current = nextSel;
        setSelection(nextSel);
      } else if (selectionRef.current.start === 0 && selectionRef.current.end === 0 && txt.length > 0) {
        const nextSel = { start: txt.length, end: txt.length };
        selectionRef.current = nextSel;
        setSelection(nextSel);
      }

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        const cursor = selectionRef.current.start || textRef.current.length;
        const range = getWordRangeBeforeCursor(textRef.current, cursor);
        if (!range) return;
        scheduleBurn(range.start, range.end, Date.now());
      }, burnDelay);
    };

    const onBurnKeyPress = (_e: any) => {};

    const tokens: Array<
      | { type: 'newline' }
      | { type: 'space'; value: string }
      | { type: 'word'; value: string; start: number; end: number }
    > = [];
    let i = 0;
    while (i < userInput.length) {
      const ch = userInput[i];
      if (ch === '\n') {
        tokens.push({ type: 'newline' });
        i += 1;
        continue;
      }
      if (ch === ' ' || ch === '\t') {
        let j = i;
        let value = '';
        while (j < userInput.length && (userInput[j] === ' ' || userInput[j] === '\t')) {
          value += userInput[j] === '\t' ? '\u00A0\u00A0' : '\u00A0';
          j += 1;
        }
        tokens.push({ type: 'space', value });
        i = j;
        continue;
      }
      const start = i;
      let value = '';
      while (i < userInput.length && !isWhitespace(userInput[i])) {
        value += userInput[i];
        i += 1;
      }
      tokens.push({ type: 'word', value, start, end: i });
    }

    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={resetSOS}>
            <Ionicons name="close" size={28} color="#C4B5FD" />
          </TouchableOpacity>
          <Text style={[styles.stepCategoryTitle, { color: selectedCategory.color }]}>{selectedCategory.title}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { 
              width: `${((currentStepIndex + 1) / selectedCategory.steps.length) * 100}%`,
              backgroundColor: selectedCategory.color 
            }]} />
          </View>
        </View>
        
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
        >
          <ScrollView
            ref={stepScrollRef as any}
            contentContainerStyle={styles.stepContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.stepText}>{step.text}</Text>
            {!!step.note && <Text style={styles.stepNote}>{step.note}</Text>}
            
            {step.type === 'input' && (
              <View style={styles.inputWrap}>
                <TextInput
                  ref={inputRef as any}
                  style={[styles.input, isBurnStep && styles.inputBurn, isBurnStep && styles.inputHiddenText]}
                  placeholder="Escribe aquí..."
                  placeholderTextColor="rgba(196, 181, 253, 0.3)"
                  multiline
                  value={userInput}
                  onChangeText={isBurnStep ? onBurnInputChange : (txt) => {
                    setUserInput(txt);
                    textRef.current = txt;
                  }}
                  selectionColor="#C4B5FD"
                  onFocus={() => {
                    setTimeout(() => scrollInputIntoView(), 50);
                  }}
                  onSelectionChange={(e: any) => {
                    const nextSel = e?.nativeEvent?.selection;
                    if (!nextSel) return;
                    if (!isBurnStep) {
                      setSelection(nextSel);
                      selectionRef.current = nextSel;
                      return;
                    }
                    const end = textRef.current.length;
                    const locked = { start: end, end };
                    if (selectionRef.current.start !== end || selectionRef.current.end !== end) {
                      selectionRef.current = locked;
                      setSelection(locked);
                    }
                  }}
                  selection={isBurnStep ? selection : undefined}
                  onKeyPress={isBurnStep ? onBurnKeyPress : undefined}
                  editable
                  autoFocus
                />

                {isBurnStep && (
                  <View pointerEvents="none" style={styles.burnWordsLayer}>
                    {tokens.map((t, idx) => {
                      if (t.type === 'newline') return <View key={`nl-${idx}`} style={styles.burnNewline} />;
                      if (t.type === 'space') return <Text key={`sp-${idx}`} style={styles.burnSpace}>{t.value}</Text>;

                      const jobKey = makeKey(t.start, t.end);
                      const state = burnStateRef.current[jobKey]?.status;
                      const anim = burnAnimRef.current[jobKey];

                      if (state === 'burned') {
                        return (
                          <Text key={`w-burned-${idx}`} style={[styles.burnWordPlain, styles.burnWordBurned]}>
                            {t.value}
                          </Text>
                        );
                      }

                      if (state !== 'burning' || !anim) {
                        return (
                          <Text key={`w-${idx}`} style={styles.burnWordPlain}>
                            {t.value}
                          </Text>
                        );
                      }

                      const color = anim.interpolate({
                        inputRange: [0, 0.3, 1],
                        outputRange: ['#FFFFFF', '#7F1D1D', '#7F1D1D'],
                        extrapolate: 'clamp',
                      });
                      const opacity = anim.interpolate({
                        inputRange: [0, 0.35, 1],
                        outputRange: [1, 1, 0],
                        extrapolate: 'clamp',
                      });

                      return (
                        <Animated.Text key={`w-burning-${idx}`} style={[styles.burnWordPlain, { color, opacity }]}>
                          {t.value}
                        </Animated.Text>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

          {step.type === 'breathing' && (
            <BreathingGuide 
              inhale={step.inhale} 
              hold={step.hold} 
              exhale={step.exhale} 
              hold2={step.hold2} 
            />
          )}

          {step.type === 'counter' && (
            <CounterGuide target={step.target} />
          )}
          
          <TouchableOpacity 
            style={[
              styles.nextButton,
              { backgroundColor: selectedCategory.color },
            ]} 
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStepIndex === selectedCategory.steps.length - 1 ? 'HE TERMINADO' : 'CONTINUAR'}
            </Text>
          </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  };

  const renderFinalMessage = () => (
    <View style={styles.finalContainer}>
      <Ionicons name="heart" size={80} color="#EF4444" style={styles.finalIcon} />
      <Text style={styles.finalTitle}>¡HECHO!</Text>
      <ScrollView style={styles.finalScroll}>
        <Text style={styles.finalText}>{SOS_FINAL_MESSAGE}</Text>
      </ScrollView>
      <TouchableOpacity style={styles.finishButton} onPress={resetSOS}>
        <Text style={styles.finishButtonText}>VOLVER AL INICIO</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LuminaBackground style={styles.container}>
      <View style={styles.safeArea}>
        {!selectedCategory && (
          <InfoButton
            title="S.O.S."
            text="SOS es un espacio para cuando algo se siente demasiado. Elegí lo que estás sintiendo y avanzá a tu ritmo. No se trata de hacerlo perfecto: se trata de acompañarte."
            top={18}
            right={16}
          />
        )}
        {!selectedCategory ? renderCategoryList() : 
         isFinished ? renderFinalMessage() : renderStep()}
      </View>
    </LuminaBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 60,
  },
  categoryContainer: {
    flex: 1,
    padding: 25,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#7F1D1D',
    letterSpacing: 4,
    marginBottom: 10,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#C4B5FD',
    marginBottom: 40,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  categoryCard: {
    width: '48%',
    aspectRatio: 0.9,
    backgroundColor: 'rgba(30, 27, 75, 0.4)',
    borderRadius: 25,
    marginBottom: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  stepContainer: {
    flex: 1,
  },
  stepHeader: {
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  stepCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 15,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepContent: {
    paddingHorizontal: 25,
    paddingBottom: 40,
    alignItems: 'center',
  },
  keyboardAvoid: {
    flex: 1,
  },
  stepText: {
    fontSize: 24,
    color: '#E9D5FF',
    textAlign: 'center',
    lineHeight: 34,
    fontWeight: '500',
    marginBottom: 30,
  },
  stepNote: {
    marginTop: 10,
    color: 'rgba(196, 181, 253, 0.75)',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  inputWrap: {
    width: '100%',
    position: 'relative',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    color: '#FFF',
    fontSize: 18,
    minHeight: 150,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
    marginBottom: 30,
  },
  inputBurn: {
    fontWeight: '700',
  },
  inputHiddenText: {
    color: 'rgba(255,255,255,0)',
    textShadowColor: 'transparent',
  },
  burnWordsLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  burnSpace: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  burnWordPlain: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  burnWordBurned: {
    opacity: 0,
  },
  burnNewline: {
    width: '100%',
    height: 24,
  },
  nextButton: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 50,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  finalContainer: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalIcon: {
    marginBottom: 20,
  },
  finalTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    letterSpacing: 4,
  },
  finalScroll: {
    maxHeight: '50%',
    marginBottom: 30,
  },
  finalText: {
    fontSize: 18,
    color: '#C4B5FD',
    textAlign: 'center',
    lineHeight: 28,
  },
  finishButton: {
    backgroundColor: '#1E1B4B',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#4C1D95',
  },
  finishButtonText: {
    color: '#FDE68A',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
