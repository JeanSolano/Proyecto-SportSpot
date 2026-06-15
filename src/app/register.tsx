import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth';
import { BorderRadius, Gradients, Shadows, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SPORTS_OPTIONS = ['Fútbol', 'Basketball', 'Tenis', 'Voleibol', 'Natación', 'Otro'];

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  iconName,
  keyboardType,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  iconName: { ios: string; android: string; web: string };
  keyboardType?: 'email-address' | 'default';
}) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</Text>
      <View style={[
        styles.inputRow,
        { backgroundColor: theme.inputBackground, borderColor: focused ? theme.primary : theme.border },
      ]}>
        <SymbolView name={iconName as any} size={18} tintColor={focused ? theme.primary : theme.textTertiary} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
}

export default function RegisterScreen({ onGoLogin }: { onGoLogin?: () => void } = {}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [loading, setLoading] = useState(false);

  const isEmailValid = email.includes('@') && email.includes('.');
  const isPasswordValid = password.length >= 6;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = name.trim().length > 0 && isEmailValid && isPasswordValid && passwordsMatch && selectedSport !== '';

  const handleRegister = () => {
    if (!name.trim()) { Alert.alert('Nombre requerido', 'Ingresa tu nombre completo.'); return; }
    if (!isEmailValid) { Alert.alert('Email inválido', 'Ingresa un correo electrónico válido.'); return; }
    if (!isPasswordValid) { Alert.alert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.'); return; }
    if (!passwordsMatch) { Alert.alert('Contraseñas no coinciden', 'Verifica que ambas contraseñas sean iguales.'); return; }
    if (!selectedSport) { Alert.alert('Deporte requerido', 'Selecciona tu deporte favorito.'); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login();
    }, 1600);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Gradient header */}
        <LinearGradient
          colors={Gradients.header.colors as [string, string, ...string[]]}
          start={Gradients.header.start}
          end={Gradients.header.end}
          style={[styles.gradientHeader, { paddingTop: insets.top + Spacing.three }]}>
          <Pressable
            onPress={onGoLogin}
            style={[styles.backBtn, { top: insets.top + Spacing.two }]}
            hitSlop={12}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </Pressable>
          <View style={styles.logoWrapper}>
            <Image
              source={require('@/assets/images/logo-glow.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
          <Text style={styles.appName}>SportSpot</Text>
          <Text style={styles.appTagline}>Únete a la comunidad deportiva</Text>
        </LinearGradient>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: theme.background }, Shadows.modal]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Crea tu cuenta</Text>

          <Field
            label="Nombre completo"
            placeholder="Carlos Méndez"
            value={name}
            onChangeText={setName}
            iconName={{ ios: 'person', android: 'person', web: 'person' }}
          />
          <Field
            label="Correo electrónico"
            placeholder="tu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            iconName={{ ios: 'envelope', android: 'mail', web: 'mail' }}
          />
          <Field
            label="Contraseña"
            placeholder="Mín. 6 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            iconName={{ ios: 'lock', android: 'lock', web: 'lock' }}
          />
          <Field
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            iconName={{
              ios: confirmPassword.length > 0 && passwordsMatch ? 'checkmark.circle' : 'lock.rotation',
              android: confirmPassword.length > 0 && passwordsMatch ? 'check_circle' : 'lock_reset',
              web: 'lock',
            }}
          />

          {/* Sport selector */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Deporte favorito</Text>
            <View style={styles.sportsGrid}>
              {SPORTS_OPTIONS.map(sport => {
                const active = sport === selectedSport;
                return (
                  <TouchableOpacity
                    key={sport}
                    onPress={() => setSelectedSport(sport)}
                    activeOpacity={0.7}
                    style={[
                      styles.sportChip,
                      {
                        backgroundColor: active ? theme.primary : theme.backgroundElement,
                        borderColor: active ? theme.primary : theme.border,
                      },
                    ]}>
                    <Text style={[styles.sportChipText, { color: active ? '#fff' : theme.textSecondary }]}>
                      {sport}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Validation hints */}
          <View style={styles.hintsRow}>
            <Text style={[styles.hint, { color: isPasswordValid ? theme.primary : theme.textTertiary }]}>
              {isPasswordValid ? '✓' : '○'} Mín. 6 caracteres
            </Text>
            <Text style={[styles.hint, { color: (confirmPassword.length > 0 && passwordsMatch) ? theme.primary : theme.textTertiary }]}>
              {(confirmPassword.length > 0 && passwordsMatch) ? '✓' : '○'} Contraseñas coinciden
            </Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.submitWrapper, !canSubmit && styles.dimmed]}
            onPress={handleRegister}
            disabled={loading}>
            <LinearGradient
              colors={Gradients.buttonPrimary.colors as [string, string, ...string[]]}
              start={Gradients.buttonPrimary.start}
              end={Gradients.buttonPrimary.end}
              style={styles.submitBtn}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitText}>Crear Cuenta</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={[styles.switchPrompt, { color: theme.textSecondary }]}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={onGoLogin} activeOpacity={0.7}>
              <Text style={[styles.switchLink, { color: theme.primary }]}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.termsRow}>
            <Text style={[styles.termsText, { color: theme.textTertiary }]}>Al registrarte, aceptas nuestros </Text>
            <TouchableOpacity><Text style={[styles.termsLink, { color: theme.primary }]}>Términos</Text></TouchableOpacity>
            <Text style={[styles.termsText, { color: theme.textTertiary }]}> y </Text>
            <TouchableOpacity><Text style={[styles.termsLink, { color: theme.primary }]}>Privacidad</Text></TouchableOpacity>
          </View>
        </View>

        <View style={{ height: insets.bottom + Spacing.three }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradientHeader: {
    alignItems: 'center',
    paddingBottom: Spacing.five,
    gap: Spacing.two,
  },
  backBtn: {
    position: 'absolute',
    left: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtnText: {
    color: 'rgba(255,255,255,0.92)',
    ...Typography.bodyBold,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  logo: {
    width: 95,
    height: 95,
  },
  appName: { ...Typography.displayLg, color: '#fff' },
  appTagline: { ...Typography.body, color: 'rgba(255,255,255,0.85)' },
  card: {
    marginTop: -BorderRadius.xl,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  cardTitle: { ...Typography.heading, marginBottom: Spacing.one },
  inputGroup: { gap: Spacing.one },
  inputLabel: { ...Typography.caption },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.three,
    height: 50,
    gap: Spacing.two,
  },
  input: { flex: 1, ...Typography.body },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  sportChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  sportChipText: { ...Typography.bodyBold },
  hintsRow: { flexDirection: 'row', gap: Spacing.three, marginTop: -Spacing.one },
  hint: { ...Typography.caption },
  submitWrapper: { borderRadius: BorderRadius.sm, overflow: 'hidden' },
  dimmed: { opacity: 0.55 },
  submitBtn: { height: 50, alignItems: 'center', justifyContent: 'center' },
  submitText: { ...Typography.bodyBold, color: '#fff', fontSize: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: -Spacing.one },
  switchPrompt: { ...Typography.body },
  switchLink: { ...Typography.bodyBold },
  termsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.two },
  termsText: { ...Typography.caption },
  termsLink: { ...Typography.caption, fontWeight: '600' },
});
