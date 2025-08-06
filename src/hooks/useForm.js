import { useState, useCallback } from 'react';
import { validation, errorHandler } from '../utils';

/**
 * Hook para gerenciamento de formulários
 */
export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Atualizar valor de um campo
  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro do campo quando valor muda
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  // Handler para inputs
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValue(name, type === 'checkbox' ? checked : value);
  }, [setValue]);

  // Handler para blur (marcar campo como tocado)
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validar campo ao sair
    if (validationRules[name]) {
      const error = validationRules[name](values[name]);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [validationRules, values]);

  // Validar todos os campos
  const validate = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validationRules[fieldName](values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values]);

  // Submeter formulário
  const handleSubmit = useCallback(async (onSubmit) => {
    // Marcar todos os campos como tocados
    const allFields = Object.keys({ ...initialValues, ...validationRules });
    const touchedFields = {};
    allFields.forEach(field => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);

    // Validar
    const isValid = validate();
    if (!isValid) {
      return { success: false, errors };
    }

    // Submeter
    setIsSubmitting(true);
    try {
      const result = await onSubmit(values);
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = errorHandler.getErrorMessage(error);
      
      // Se o erro contém informações específicas de campos, aplicá-las
      if (error.fieldErrors) {
        setErrors(prev => ({
          ...prev,
          ...error.fieldErrors
        }));
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, errors, initialValues, validationRules]);

  // Reset do formulário
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Definir valores do formulário
  const setFormValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  // Obter props para um campo específico
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] && errors[name],
    required: !!validationRules[name]
  }), [values, handleChange, handleBlur, touched, errors, validationRules]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    reset,
    setFormValues,
    getFieldProps,
    isValid: Object.keys(errors).length === 0,
    isDirty: JSON.stringify(values) !== JSON.stringify(initialValues)
  };
};

/**
 * Regras de validação pré-definidas
 */
export const validationRules = {
  // Campos obrigatórios
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'Este campo é obrigatório';
    }
    return null;
  },

  // Email
  email: (value) => validation.email(value),

  // Senha
  password: (value) => validation.password(value),

  // Nome
  name: (value) => validation.name(value),

  // Telefone
  phone: (value) => validation.phone(value),

  // Username
  username: (value) => validation.username(value),

  // Conteúdo do post
  postContent: (value) => validation.postContent(value),

  // Confirmar senha
  confirmPassword: (originalPassword) => (value) => {
    if (!value) return 'Confirmação de senha é obrigatória';
    if (value !== originalPassword) return 'Senhas não coincidem';
    return null;
  },

  // Tamanho mínimo
  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Deve ter pelo menos ${min} caracteres`;
    }
    return null;
  },

  // Tamanho máximo
  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Deve ter no máximo ${max} caracteres`;
    }
    return null;
  },

  // Aceitar termos
  acceptTerms: (value) => {
    if (!value) return 'Você deve aceitar os termos de uso';
    return null;
  }
};
