import { useState } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import type { Word } from '@/data/scenes';
import { useStyles } from '../styles';

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
        <Text style={styles.questionIpa}>Gợi ý: {word.meaning}</Text>
      </View>
      <TextInput
        accessibilityLabel="Điền từ hoặc cụm vừa học"
        placeholder="Nhập từ hoặc cụm vừa học"
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
          label="Kiểm tra"
          disabled={!value.trim()}
          onPress={check}
        />
      )}
    </>
  );
}
