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

function InputField({
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
        <SymbolView
          name={iconName as any}
          size={18}
          tintColor={focused ? theme.primary : theme.textTertiary}
        />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
}

export default function LoginScreen({ onGoRegister }: { onGoRegister?: () => void } = {}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 4;

  const handleLogin = () => {
    if (!canSubmit) {
      Alert.alert('Campos incompletos', 'Ingresa tu correo y contraseña para continuar.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login();
    }, 1400);
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
          style={[styles.gradientHeader, { paddingTop: insets.top + Spacing.four }]}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('@/assets/images/logo-glow.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
          <Text style={styles.appName}>SportSpot</Text>
          <Text style={styles.appTagline}>Tu red social deportiva en Panamá</Text>
        </LinearGradient>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: theme.background }, Shadows.modal]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Inicia Sesión</Text>

          <InputField
            label="Correo electrónico"
            placeholder="tu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            iconName={{ ios: 'envelope', android: 'mail', web: 'mail' }}
          />
          <InputField
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            iconName={{ ios: 'lock', android: 'lock', web: 'lock' }}
          />

          <TouchableOpacity style={styles.forgotRow} activeOpacity={0.7}>
            <Text style={[styles.forgotText, { color: theme.primary }]}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.submitWrapper, !canSubmit && styles.dimmed]}
            onPress={handleLogin}
            disabled={loading}>
            <LinearGradient
              colors={Gradients.buttonPrimary.colors as [string, string, ...string[]]}
              start={Gradients.buttonPrimary.start}
              end={Gradients.buttonPrimary.end}
              style={styles.submitBtn}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitText}>Iniciar Sesión</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={[styles.switchPrompt, { color: theme.textSecondary }]}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={onGoRegister} activeOpacity={0.7}>
              <Text style={[styles.switchLink, { color: theme.primary }]}>Regístrate gratis</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textTertiary }]}>O continúa con</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          <View style={styles.socialRow}>
            <Pressable style={({ pressed }) => [
              styles.socialBtn,
              { backgroundColor: theme.background, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
            ]}>
              <Text style={[styles.socialText, { color: theme.text }]}>Google</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [
              styles.socialBtn,
              { backgroundColor: theme.background, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
            ]}>
              <Text style={[styles.socialText, { color: theme.text }]}>Facebook</Text>
            </Pressable>
          </View>

          <View style={styles.termsRow}>
            <Text style={[styles.termsText, { color: theme.textTertiary }]}>Al continuar, aceptas nuestros </Text>
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
    paddingBottom: Spacing.six,
    gap: Spacing.two,
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
  forgotRow: { alignItems: 'flex-end', marginTop: -Spacing.one },
  forgotText: { ...Typography.bodyBold },
  submitWrapper: { borderRadius: BorderRadius.sm, overflow: 'hidden' },
  dimmed: { opacity: 0.55 },
  submitBtn: { height: 50, alignItems: 'center', justifyContent: 'center' },
  submitText: { ...Typography.bodyBold, color: '#fff', fontSize: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: -Spacing.one },
  switchPrompt: { ...Typography.body },
  switchLink: { ...Typography.bodyBold },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: { ...Typography.caption },
  socialRow: { flexDirection: 'row', gap: Spacing.three },
  socialBtn: { flex: 1, height: 48, borderWidth: 1, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  socialText: { ...Typography.bodyBold },
  termsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.two },
  termsText: { ...Typography.caption },
  termsLink: { ...Typography.caption, fontWeight: '600' },
});
