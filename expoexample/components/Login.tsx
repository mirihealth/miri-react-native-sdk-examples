import { SafeAreaView, TextInput, StyleSheet } from "react-native";
import {
  Button,
  Text,
  useAuthVerificationAPI,
} from "@miri-ai/miri-react-native";
import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@react-navigation/native";

export const Login = () => {
  const theme = useTheme();
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [verificationCode, setVerificationCode] = useState<string>();
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { startSMSVerification, completeSMSVerification } =
    useAuthVerificationAPI();
  const { setIdToken } = useAuth();

  const handlePhoneNumberChange = useCallback((value: string) => {
    setPhoneNumber(value);
  }, []);

  const handlePhoneNumberSubmit = useCallback(() => {
    if (!phoneNumber) {
      return;
    }
    setIsSubmitting(true);
    try {
      startSMSVerification(phoneNumber);
      setShowVerificationInput(true);
    } catch (error) {
      console.error("Error starting SMS verification:", error);
      setPhoneNumber("");
      setVerificationCode("");
      setShowVerificationInput(false);
    }

    setIsSubmitting(false);
  }, [phoneNumber, startSMSVerification]);

  const handleVerificationCodeChange = useCallback((value: string) => {
    setVerificationCode(value);
  }, []);

  const handleVerificationCodeSubmit = useCallback(async () => {
    if (!verificationCode || !phoneNumber) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await completeSMSVerification(
        phoneNumber,
        verificationCode
      );
      setIdToken(token);
      setShowVerificationInput(false);
    } catch (error) {
      console.error("Error verifying SMS code:", error);
      setPhoneNumber("");
      setVerificationCode("");
      setShowVerificationInput(false);
    }

    setIsSubmitting(false);
  }, [verificationCode, phoneNumber, completeSMSVerification, setIdToken]);
  return (
    <SafeAreaView style={styles.authForm}>
      <Text style={styles.authFormHeader}>Sign In to Miri</Text>
      {!showVerificationInput && (
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
            },
          ]}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
        />
      )}
      {showVerificationInput && (
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
            },
          ]}
          placeholder="Verification Code"
          value={verificationCode}
          onChangeText={handleVerificationCodeChange}
        />
      )}
      <Button
        loading={isSubmitting}
        onPress={
          showVerificationInput
            ? handleVerificationCodeSubmit
            : handlePhoneNumberSubmit
        }
      >
        {showVerificationInput ? "Send Verification Code" : "Send SMS"}
      </Button>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  authForm: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  authFormHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
});
