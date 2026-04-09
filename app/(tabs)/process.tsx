import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import LuminaBackground from '../../components/LuminaBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { SOS_DATA } from '../../constants/Data';
import InfoButton from '../../components/InfoButton';

type DayEntrySession = {
  answers: string[];
  lockedCount: number;
  completed: boolean;
};

type DayEntry = {
  morning: DayEntrySession;
  night: DayEntrySession;
};

const ENTRIES_KEY = 'lumina_ritual_entries_v1';
const SOS_USAGE_KEY = 'lumina_sos_usage_v1';
const RITUAL_PROGRESS_KEY = 'lumina_ritual_progress_v2';
const RITUAL_START_DATE_KEY = 'lumina_ritual_start_date';
const ORACLE_USAGE_KEY = 'lumina_oracle_usage_v1';
const ORACLE_START_DATE_KEY = 'lumina_oracle_start_date';
const APP_START_DATE_KEY = 'lumina_app_start_date';

type RitualProgress = {
  day: number;
  morningCompleted: boolean;
  nightCompleted: boolean;
  lastCompletedDate: string | null;
};

const SLEEP_MESSAGES = {
  balanced: [
    'Le estás dando a tu cuerpo el descanso que necesita, y eso se nota en tu energía. Seguí escuchándote así.',
    'Tu descanso está acompañando tu bienestar. Estás cuidándote más de lo que creés.',
    'Dormir bien también es amor propio. Estás sosteniendo un ritmo que te hace bien.',
  ],
  couldImprove: [
    'Tal vez tu cuerpo esté pidiendo un poquito más de descanso. Escucharlo puede cambiar mucho cómo te sentís.',
    'Estás haciendo lo que podés, y eso ya vale. Quizás sumar un poco más de sueño te ayude a sentirte mejor.',
    'Un pequeño ajuste en tu descanso podría traer más claridad y calma a tus días.',
  ],
  veryLow: [
    'Tu cuerpo y tu mente están necesitando descanso. Merecés parar y recargarte sin culpa.',
    'Dormir también es sanar. Regalate momentos de pausa, aunque sean pequeños.',
    'No tenés que poder con todo. Descansar es una forma de cuidarte profundamente.',
  ],
};

type MoodKey = 'happy' | 'sad' | 'calm' | 'anger' | 'fear' | 'confident' | 'anxious' | 'gratitude';

const MOOD_META: Record<
  MoodKey,
  {
    label: string;
    emoji: string;
    color: string;
    raw: 'Alegría' | 'Tristeza' | 'Calma' | 'Furia' | 'Miedo' | 'Confianza' | 'Ansiedad' | 'Gratitud';
  }
> = {
  happy: { label: 'Más feliz', emoji: '💛', color: '#FDE68A', raw: 'Alegría' },
  sad: { label: 'Más triste', emoji: '🌧', color: '#93C5FD', raw: 'Tristeza' },
  calm: { label: 'Más calma', emoji: '🌿', color: '#A7F3D0', raw: 'Calma' },
  anger: { label: 'Más furia', emoji: '🔥', color: '#FDBA74', raw: 'Furia' },
  fear: { label: 'Más miedo', emoji: '🌫', color: '#C4B5FD', raw: 'Miedo' },
  confident: { label: 'Más confiada', emoji: '✨', color: '#F472B6', raw: 'Confianza' },
  anxious: { label: 'Más ansiosa', emoji: '🌪', color: '#FCA5A5', raw: 'Ansiedad' },
  gratitude: { label: 'Más gratitud', emoji: '🙏', color: '#FDE68A', raw: 'Gratitud' },
};

const MOOD_MESSAGES: Record<MoodKey, [string, string, string]> = {
  happy: [
    'Hay una luz en vos que está brillando más fuerte. Permitite disfrutar este momento.',
    'Tu energía refleja bienestar. Estás conectando con lo que te hace bien.',
    'Estás cultivando momentos de alegría. Eso también es un logro.',
  ],
  sad: [
    'Está bien no estar bien a veces. Lo que sentís merece espacio y cuidado.',
    'Tu tristeza no te define, pero sí merece ser escuchada con amor.',
    'Incluso en días difíciles, estás sosteniéndote. Y eso ya es mucho.',
  ],
  calm: [
    'Estás encontrando un espacio interno de tranquilidad. Eso es valioso.',
    'La calma que estás sintiendo es una señal de equilibrio interno.',
    'Seguí nutriendo esa paz. Es un lugar al que siempre podés volver.',
  ],
  anger: [
    'La intensidad que sentís tiene algo para decirte. Escucharla puede ayudarte a transformarla.',
    'Tu enojo es energía. Canalizarla con conciencia puede liberarte.',
    'No hay nada malo en sentir furia, lo importante es cómo te acompañás en ese momento.',
  ],
  fear: [
    'El miedo aparece cuando algo importa. Estás más cerca de lo que creés.',
    'Podés avanzar incluso con miedo. No necesitas eliminarlo para seguir.',
    'El miedo no es tu límite, es una señal para ir con más cuidado y amor.',
  ],
  confident: [
    'Estás confiando más en vos, y eso cambia todo.',
    'Tu seguridad interna está creciendo. Seguí apoyándote en ella.',
    'La confianza que sentís es el resultado de tu camino. Honrala.',
  ],
  anxious: [
    'Tu mente está muy activa, pero vos podés volver al presente poco a poco.',
    'Respirar, pausar y bajar el ritmo puede ayudarte más de lo que imaginás.',
    'No estás sola en esto. La ansiedad pasa, y vos tenés recursos para atravesarla.',
  ],
  gratitude: [
    'La gratitud que sentís es una forma de presencia. Dejala expandirse con suavidad.',
    'Estás reconociendo lo que sí está. Ese gesto interno sostiene mucho más de lo que parece.',
    'Agradecerte también cuenta. Estás haciendo espacio para lo bueno, incluso en lo simple.',
  ],
};

const ORACLE_MESSAGES: [string, string, string] = [
  'Abrir el oráculo también es una forma de escucharte. Un gesto simple que puede cambiar tu día.',
  'Volver a tu carta del día es volver a tu centro. Incluso si te olvidás, siempre podés retomar.',
  'Tu constancia se arma con detalles. Una carta por día, con amor y sin exigencia.',
];

function parseHours(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(',', '.').trim();
  if (!normalized) return null;
  const num = Number(normalized);
  if (!Number.isFinite(num)) return null;
  if (num <= 0 || num > 24) return null;
  return num;
}

function parseMood(value: unknown): MoodKey | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;

  if (normalized === 'alegría' || normalized === 'alegria') return 'happy';
  if (normalized === 'tristeza') return 'sad';
  if (normalized === 'calma') return 'calm';
  if (normalized === 'furia') return 'anger';
  if (normalized === 'miedo') return 'fear';
  if (normalized === 'confianza') return 'confident';
  if (normalized === 'ansiedad') return 'anxious';
  if (normalized === 'gratitud') return 'gratitude';
  return null;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isoToUtcDayNumber(iso: string): number {
  const [y, m, d] = iso.split('-').map((v) => Number(v));
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

function diffDays(aIso: string, bIso: string): number {
  return isoToUtcDayNumber(aIso) - isoToUtcDayNumber(bIso);
}

export default function ProcessScreen() {
  const [avgHours, setAvgHours] = useState<number | null>(null);
  const [sampleCount, setSampleCount] = useState(0);
  const [moodSampleCount, setMoodSampleCount] = useState(0);
  const [moodCounts, setMoodCounts] = useState<Record<MoodKey, number>>({
    happy: 0,
    sad: 0,
    calm: 0,
    anger: 0,
    fear: 0,
    confident: 0,
    anxious: 0,
    gratitude: 0,
  });
  const [recentMoods, setRecentMoods] = useState<MoodKey[]>([]);
  const [sosTotal, setSosTotal] = useState(0);
  const [sosByCategory, setSosByCategory] = useState<Record<string, number>>({});
  const [sosDaysCount, setSosDaysCount] = useState(0);
  const [ritualBestStreak, setRitualBestStreak] = useState(0);
  const [ritualDaysDone, setRitualDaysDone] = useState(0);
  const [ritualDaysWithout, setRitualDaysWithout] = useState(0);
  const [ritualSampleWindowDays, setRitualSampleWindowDays] = useState(30);
  const [ritualRemainingDays, setRitualRemainingDays] = useState(30);
  const [oracleBestStreak, setOracleBestStreak] = useState(0);
  const [oracleDaysDone, setOracleDaysDone] = useState(0);
  const [oracleDaysWithout, setOracleDaysWithout] = useState(0);
  const [oracleSampleWindowDays, setOracleSampleWindowDays] = useState(30);

  const messageIndex = useMemo(() => {
    const dayOfMonth = new Date().getDate();
    return (dayOfMonth - 1) % 3;
  }, []);

  const sleepBand = useMemo(() => {
    if (avgHours === null) return null;
    if (avgHours >= 7 && avgHours <= 9) return 'balanced';
    if (avgHours >= 5 && avgHours < 7) return 'couldImprove';
    if (avgHours >= 2 && avgHours < 5) return 'veryLow';
    return 'couldImprove';
  }, [avgHours]);

  const sleepMessage = useMemo(() => {
    if (!sleepBand) return 'Cuando registres tus mañanas, acá vas a ver cómo viene tu descanso con una lectura suave y amorosa.';
    return SLEEP_MESSAGES[sleepBand][messageIndex];
  }, [messageIndex, sleepBand]);

  const dominantMood = useMemo(() => {
    const entries = Object.entries(moodCounts) as Array<[MoodKey, number]>;
    let top: MoodKey | null = null;
    let max = 0;
    for (const [k, v] of entries) {
      if (v > max) {
        max = v;
        top = k;
      }
    }
    if (!top || max === 0) return null;

    const tied = entries.filter(([, v]) => v === max).map(([k]) => k);
    if (tied.length <= 1) return top;

    for (let i = recentMoods.length - 1; i >= 0; i--) {
      const m = recentMoods[i];
      if (tied.includes(m)) return m;
    }

    return top;
  }, [moodCounts, recentMoods]);

  const moodMessage = useMemo(() => {
    if (!dominantMood) return 'Cuando completes tus noches, acá vas a ver un mapa simple de cómo te estuviste sintiendo.';
    return MOOD_MESSAGES[dominantMood][messageIndex];
  }, [dominantMood, messageIndex]);

  const oracleMessage = useMemo(() => {
    return ORACLE_MESSAGES[messageIndex];
  }, [messageIndex]);

  const loadProcess = useCallback(async () => {
    try {
      const [
        savedEntries,
        savedSos,
        savedRitualProgress,
        savedRitualStartDate,
        savedOracleUsage,
        savedOracleStartDate,
        savedAppStartDate,
      ] = await Promise.all([
        AsyncStorage.getItem(ENTRIES_KEY),
        AsyncStorage.getItem(SOS_USAGE_KEY),
        AsyncStorage.getItem(RITUAL_PROGRESS_KEY),
        AsyncStorage.getItem(RITUAL_START_DATE_KEY),
        AsyncStorage.getItem(ORACLE_USAGE_KEY),
        AsyncStorage.getItem(ORACLE_START_DATE_KEY),
        AsyncStorage.getItem(APP_START_DATE_KEY),
      ]);
      const parsed: Record<number, DayEntry> = savedEntries ? JSON.parse(savedEntries) : {};
      const hours: number[] = [];
      const moods: MoodKey[] = [];

      for (const key of Object.keys(parsed)) {
        const dayNumber = Number(key);
        if (!Number.isFinite(dayNumber)) continue;
        const entry = parsed[dayNumber];
        const first = entry?.morning?.answers?.[0];
        const parsedHours = parseHours(first);
        if (parsedHours !== null) hours.push(parsedHours);

        const firstMood = entry?.night?.answers?.[0];
        const parsedMood = parseMood(firstMood);
        if (parsedMood) moods.push(parsedMood);
      }

      const last30 = hours.slice(-30);
      if (!last30.length) {
        setAvgHours(null);
        setSampleCount(0);
      } else {
        const sum = last30.reduce((a, b) => a + b, 0);
        setAvgHours(sum / last30.length);
        setSampleCount(last30.length);
      }

      const last30Moods = moods.slice(-30);
      const nextCounts: Record<MoodKey, number> = {
        happy: 0,
        sad: 0,
        calm: 0,
        anger: 0,
        fear: 0,
        confident: 0,
        anxious: 0,
        gratitude: 0,
      };
      for (const m of last30Moods) nextCounts[m] += 1;
      setMoodCounts(nextCounts);
      setMoodSampleCount(last30Moods.length);
      setRecentMoods(moods.slice(-14));

      const sosParsed = savedSos ? JSON.parse(savedSos) : {};
      const byDay = typeof sosParsed.byDay === 'object' && sosParsed.byDay ? sosParsed.byDay : {};
      const today = new Date();
      const keys: string[] = [];
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        keys.push(d.toISOString().split('T')[0]);
      }

      const totalsByCategory: Record<string, number> = {};
      let total = 0;
      let daysWithUse = 0;

      for (const k of keys) {
        const dayEntry = byDay[k];
        if (!dayEntry) continue;
        const dayTotal = typeof dayEntry.total === 'number' ? dayEntry.total : 0;
        if (dayTotal > 0) daysWithUse += 1;
        total += dayTotal;
        const dayCats = typeof dayEntry.byCategory === 'object' && dayEntry.byCategory ? dayEntry.byCategory : {};
        for (const catId of Object.keys(dayCats)) {
          const count = typeof dayCats[catId] === 'number' ? dayCats[catId] : 0;
          totalsByCategory[catId] = (totalsByCategory[catId] ?? 0) + count;
        }
      }

      setSosTotal(total);
      setSosByCategory(totalsByCategory);
      setSosDaysCount(daysWithUse);

      const progress: RitualProgress[] = savedRitualProgress ? JSON.parse(savedRitualProgress) : [];
      const completionDates = Array.from(
        new Set(
          progress
            .filter((p) => p?.morningCompleted && p?.nightCompleted && isIsoDate(p?.lastCompletedDate))
            .map((p) => p.lastCompletedDate as string)
        )
      ).sort();

      let best = 0;
      let run = 0;
      for (let i = 0; i < completionDates.length; i++) {
        if (i === 0) {
          run = 1;
        } else {
          const delta = diffDays(completionDates[i], completionDates[i - 1]);
          run = delta === 1 ? run + 1 : 1;
        }
        if (run > best) best = run;
      }

      const todayIso = new Date().toISOString().split('T')[0];
      const appStartIso = isIsoDate(savedAppStartDate) ? savedAppStartDate : todayIso;
      if (!savedAppStartDate) await AsyncStorage.setItem(APP_START_DATE_KEY, appStartIso);

      const windowDays = Math.max(1, diffDays(todayIso, appStartIso) + 1);
      const windowStartIso = appStartIso;

      const doneInWindow = completionDates.filter((d) => d >= windowStartIso && d <= todayIso).length;
      const without = Math.max(0, windowDays - doneInWindow);
      const completedTotal = Array.isArray(progress)
        ? progress.filter((p) => p?.morningCompleted && p?.nightCompleted).length
        : 0;
      const remaining = Math.max(0, 30 - completedTotal);

      setRitualBestStreak(best);
      setRitualDaysDone(completedTotal);
      setRitualDaysWithout(without);
      setRitualSampleWindowDays(windowDays);
      setRitualRemainingDays(remaining);

      const oracleParsed = savedOracleUsage ? JSON.parse(savedOracleUsage) : {};
      const oracleByDay = typeof oracleParsed.byDay === 'object' && oracleParsed.byDay ? oracleParsed.byDay : {};
      const oracleDates = Object.keys(oracleByDay).filter(isIsoDate).sort();

      let oracleBest = 0;
      let oracleRun = 0;
      for (let i = 0; i < oracleDates.length; i++) {
        if (i === 0) oracleRun = 1;
        else {
          const delta = diffDays(oracleDates[i], oracleDates[i - 1]);
          oracleRun = delta === 1 ? oracleRun + 1 : 1;
        }
        if (oracleRun > oracleBest) oracleBest = oracleRun;
      }

      const oracleDoneInWindow = oracleDates.filter((d) => d >= windowStartIso && d <= todayIso).length;
      const oracleWithout = Math.max(0, windowDays - oracleDoneInWindow);

      setOracleBestStreak(oracleBest);
      setOracleDaysDone(oracleDoneInWindow);
      setOracleDaysWithout(oracleWithout);
      setOracleSampleWindowDays(windowDays);
    } catch (e) {
      setAvgHours(null);
      setSampleCount(0);
      setMoodSampleCount(0);
      setMoodCounts({
        happy: 0,
        sad: 0,
        calm: 0,
        anger: 0,
        fear: 0,
        confident: 0,
        anxious: 0,
        gratitude: 0,
      });
      setRecentMoods([]);
      setSosTotal(0);
      setSosByCategory({});
      setSosDaysCount(0);
      setRitualBestStreak(0);
      setRitualDaysDone(0);
      setRitualDaysWithout(0);
      setRitualSampleWindowDays(30);
      setRitualRemainingDays(30);
      setOracleBestStreak(0);
      setOracleDaysDone(0);
      setOracleDaysWithout(0);
      setOracleSampleWindowDays(30);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProcess();
      return undefined;
    }, [loadProcess])
  );

  return (
    <LuminaBackground style={styles.container}>
      <InfoButton
        title="Tu Proceso"
        text="Acá podés ver tu camino. Tus horas de sueño, tus estados de ánimo, las veces que necesitaste el SOS, y tus rachas en el oráculo y el ritual. Es un reflejo de cómo te estás acompañando día a día."
        top={56}
        right={16}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Tu Proceso</Text>
          <Text style={styles.subtitle}>Un espacio para observarte con amor, sin juicio.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sueño</Text>
          <Text style={styles.cardHint}>Promedio (últimos {sampleCount || 0} registros)</Text>

          <View style={styles.valueRow}>
            <Text style={styles.valueNumber}>{avgHours === null ? '—' : avgHours.toFixed(1)}</Text>
            <Text style={styles.valueUnit}>hs</Text>
          </View>

          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{sleepMessage}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estado de ánimo</Text>
          <Text style={styles.cardHint}>Promedio (últimos {moodSampleCount || 0} registros)</Text>

          <View style={styles.moodHeaderRow}>
            <Text style={styles.moodHeaderLabel}>
              {dominantMood ? `${MOOD_META[dominantMood].emoji} ${MOOD_META[dominantMood].label}` : '—'}
            </Text>
          </View>

          <View style={styles.moodTimeline}>
            {Array.from({ length: 14 }).map((_, idx) => {
              const mood = recentMoods[idx];
              const color = mood ? MOOD_META[mood].color : 'rgba(255,255,255,0.08)';
              return <View key={idx} style={[styles.moodDot, { backgroundColor: color }]} />;
            })}
          </View>

          <View style={styles.moodBars}>
            {(Object.keys(MOOD_META) as MoodKey[]).map((k) => {
              const count = moodCounts[k];
              const total = moodSampleCount || 0;
              const pct = total ? count / total : 0;
              return (
                <View key={k} style={styles.moodBarRow}>
                  <Text style={styles.moodBarLabel}>
                    {MOOD_META[k].emoji} {MOOD_META[k].raw}
                  </Text>
                  <View style={styles.moodBarTrack}>
                    <View style={[styles.moodBarFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: MOOD_META[k].color }]} />
                  </View>
                  <Text style={styles.moodBarCount}>{count}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{moodMessage}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Uso de SOS</Text>
          <Text style={styles.cardHint}>Últimos 30 días</Text>

          <View style={styles.sosBars}>
            {SOS_DATA.map((cat) => {
              const count = sosByCategory[cat.id] ?? 0;
              const pct = sosTotal ? count / sosTotal : 0;
              return (
                <View key={cat.id} style={styles.sosBarRow}>
                  <Text style={styles.sosBarLabel}>{cat.title}</Text>
                  <View style={styles.sosBarTrack}>
                    <View style={[styles.sosBarFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: cat.color }]} />
                  </View>
                  <Text style={styles.sosBarCount}>{sosTotal ? `${Math.round(pct * 100)}%` : '—'}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ritual</Text>
          <Text style={styles.cardHint}>Registro (desde que empezaste)</Text>

          <View style={styles.ritualSummaryRow}>
            <View style={styles.ritualSummaryBoxAlt}>
              <Text style={styles.ritualSummaryNumberAlt}>{Number.isFinite(ritualBestStreak) ? ritualBestStreak : 0}</Text>
              <Text style={styles.ritualSummaryLabel}>mejor racha</Text>
            </View>
            <View style={styles.ritualSummaryBox}>
              <Text style={styles.ritualSummaryNumber}>{Number.isFinite(ritualDaysDone) ? ritualDaysDone : 0}</Text>
              <Text style={styles.ritualSummaryLabel}>días completos</Text>
            </View>
          </View>

          <View style={styles.ritualMetaRow}>
            <Text style={styles.ritualMetaText}>quedan {ritualRemainingDays} días de ritual</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Oráculo</Text>
          <Text style={styles.cardHint}>Registro (desde que empezaste)</Text>

          <View style={styles.oracleSummaryRow}>
            <View style={styles.oracleSummaryBoxAlt}>
              <Text style={styles.oracleSummaryNumberAlt}>{oracleBestStreak}</Text>
              <Text style={styles.oracleSummaryLabel}>mejor racha</Text>
            </View>
            <View style={styles.oracleSummaryBox}>
              <Text style={styles.oracleSummaryNumber}>{oracleDaysDone}</Text>
              <Text style={styles.oracleSummaryLabel}>días que abriste</Text>
            </View>
            <View style={styles.oracleSummaryBoxNeutral}>
              <Text style={styles.oracleSummaryNumberNeutral}>{oracleDaysWithout}</Text>
              <Text style={styles.oracleSummaryLabel}>días sin</Text>
            </View>
          </View>

          <View style={styles.oracleMetaRow}>
            <Text style={styles.oracleMetaText}>
              {oracleDaysWithout > 0 ? 'Si hoy todavía no lo abriste, tu carta te está esperando.' : 'Hoy ya te regalaste tu momento con el oráculo.'}
            </Text>
          </View>

          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{oracleMessage}</Text>
          </View>
        </View>
      </ScrollView>
    </LuminaBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 70,
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 22,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#E9D5FF',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(196, 181, 253, 0.9)',
  },
  card: {
    backgroundColor: 'rgba(26, 16, 61, 0.7)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#E9D5FF',
    fontSize: 18,
    fontWeight: '800',
  },
  cardHint: {
    marginTop: 4,
    color: 'rgba(233, 213, 255, 0.65)',
    fontSize: 12,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 14,
  },
  valueNumber: {
    color: '#FDE68A',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 1,
  },
  valueUnit: {
    color: 'rgba(253, 230, 138, 0.75)',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
    marginBottom: 10,
  },
  messageBox: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
    borderRadius: 18,
    padding: 14,
  },
  messageText: {
    color: 'rgba(233, 213, 255, 0.9)',
    fontSize: 13,
    lineHeight: 19,
  },
  placeholderCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.16)',
    marginBottom: 12,
  },
  placeholderTitle: {
    color: '#C4B5FD',
    fontSize: 16,
    fontWeight: '800',
  },
  placeholderText: {
    marginTop: 6,
    color: 'rgba(196, 181, 253, 0.55)',
    fontSize: 12,
  },
  moodHeaderRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodHeaderLabel: {
    color: '#FDE68A',
    fontSize: 16,
    fontWeight: '900',
  },
  moodTimeline: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  moodDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  moodBars: {
    marginTop: 16,
    gap: 10,
  },
  moodBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  moodBarLabel: {
    width: 110,
    color: 'rgba(233, 213, 255, 0.85)',
    fontSize: 12,
    fontWeight: '700',
  },
  moodBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.18)',
  },
  moodBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  moodBarCount: {
    width: 22,
    textAlign: 'right',
    color: 'rgba(233, 213, 255, 0.55)',
    fontSize: 12,
    fontWeight: '700',
  },
  sosSummaryRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 12,
  },
  sosSummaryBox: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  sosSummaryNumber: {
    color: '#FDE68A',
    fontSize: 28,
    fontWeight: '900',
  },
  sosSummaryLabel: {
    marginTop: 4,
    color: 'rgba(233, 213, 255, 0.7)',
    fontSize: 12,
    fontWeight: '700',
  },
  sosBars: {
    marginTop: 14,
    gap: 10,
  },
  sosBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sosBarLabel: {
    width: 130,
    color: 'rgba(233, 213, 255, 0.85)',
    fontSize: 12,
    fontWeight: '800',
  },
  sosBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.18)',
  },
  sosBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  sosBarCount: {
    width: 22,
    textAlign: 'right',
    color: 'rgba(233, 213, 255, 0.55)',
    fontSize: 12,
    fontWeight: '700',
  },
  ritualSummaryRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 12,
  },
  ritualSummaryBox: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.35)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  ritualSummaryBoxAlt: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  ritualSummaryBoxNeutral: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.22)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  ritualSummaryNumber: {
    color: '#A78BFA',
    fontSize: 28,
    fontWeight: '900',
  },
  ritualSummaryNumberAlt: {
    color: '#10B981',
    fontSize: 28,
    fontWeight: '900',
  },
  ritualSummaryNumberNeutral: {
    color: '#C4B5FD',
    fontSize: 28,
    fontWeight: '900',
  },
  ritualSummaryLabel: {
    marginTop: 4,
    color: 'rgba(233, 213, 255, 0.7)',
    fontSize: 12,
    fontWeight: '700',
  },
  ritualMetaRow: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.18)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  ritualMetaText: {
    color: 'rgba(233, 213, 255, 0.85)',
    fontSize: 13,
    fontWeight: '700',
  },
  oracleSummaryRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 12,
  },
  oracleSummaryBox: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  oracleSummaryBoxAlt: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  oracleSummaryBoxNeutral: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.55)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  oracleSummaryNumber: {
    color: '#A78BFA',
    fontSize: 28,
    fontWeight: '900',
  },
  oracleSummaryNumberAlt: {
    color: '#10B981',
    fontSize: 28,
    fontWeight: '900',
  },
  oracleSummaryNumberNeutral: {
    color: '#EF4444',
    fontSize: 28,
    fontWeight: '900',
  },
  oracleSummaryLabel: {
    marginTop: 4,
    color: 'rgba(233, 213, 255, 0.7)',
    fontSize: 12,
    fontWeight: '700',
  },
  oracleMetaRow: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.18)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  oracleMetaText: {
    color: 'rgba(233, 213, 255, 0.85)',
    fontSize: 13,
    fontWeight: '700',
  },
});
