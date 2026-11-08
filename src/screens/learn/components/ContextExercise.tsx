import { useState } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useI18n } from '@/i18n';
import type { Word } from '@/data/scenes';
import { useStyles } from '../styles/styles';

export function ContextExercise({
  word,
  sentence,
  answered,
  onAnswer,
}: {
  word: Word;
  sentence: string;
  answered: boolean;
  onAnswer: (value: string) => void;
}) {
  const { styles, colors } = useStyles();
  const { strings } = useI18n();
  const [value, setValue] = useState('');
  const check = () => {
    if (!value.trim() || answered) return;
    Keyboard.dismiss();
    onAnswer(value);
  };
  return (
    <>
      <View style={styles.question}>
        <Text style={styles.answerExample}>{sentence}</Text>
        <Text style={styles.questionIpa}>
          {strings.quiz.contextHint(word.meaning)}
        </Text>
      </View>
      <TextInput
        accessibilityLabel={strings.quiz.contextInputLabel}
        placeholder={strings.quiz.contextInputPlaceholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={setValue}
        editable={!answered}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={check}
        style={styles.contextInput}
      />
      {!answered && (
        <PrimaryButton
          label={strings.quiz.contextCheckBtn}
          disabled={!value.trim()}
          onPress={check}
        />
      )}
    </>
  );
}
