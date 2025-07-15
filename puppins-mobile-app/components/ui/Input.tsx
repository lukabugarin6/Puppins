import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { SvgProps } from 'react-native-svg';

type InputProps = TextInputProps & {
  label: string;
  Icon?: React.FC<SvgProps>;
  error?: string;
  additionalElement?: React.ReactNode;
};

const Input: React.FC<InputProps> = ({
  label,
  Icon,
  error,
  additionalElement,
  ...rest
}) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {Icon && <Icon width={20} height={20} style={styles.icon} />}
        <TextInput
          style={styles.input}
          placeholderTextColor="#999"
          {...rest}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {additionalElement && (
        <View style={styles.additionalElement}>
          {additionalElement}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    color: '#000',
    fontFamily: "DefaultMedium"
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    // backgroundColor: '#fafafa', 
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 14,
    color: '#000',
    fontFamily: "DefaultRegular"
  },
  icon: {
    marginRight: 8,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    position: 'absolute',
    bottom: -18,
    left: 0,
  },
  additionalElement: {
    position: 'absolute',
    bottom: -18,
    right: 0,
  },
});

export default Input;
