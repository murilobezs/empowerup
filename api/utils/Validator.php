<?php
/**
 * Classe de validação de dados
 */

class Validator {
    private $errors = [];
    private $data = [];
    
    public function __construct($data = []) {
        $this->data = $data;
    }
    
    /**
     * Validar campo obrigatório
     */
    public function required($field, $message = null) {
        if (!isset($this->data[$field]) || empty(trim($this->data[$field]))) {
            $this->errors[$field][] = $message ?? "O campo {$field} é obrigatório";
        }
        return $this;
    }
    
    /**
     * Validar email
     */
    public function email($field, $message = null) {
        if (isset($this->data[$field]) && !Helper::validateEmail($this->data[$field])) {
            $this->errors[$field][] = $message ?? "Email inválido";
        }
        return $this;
    }
    
    /**
     * Validar tamanho mínimo
     */
    public function min($field, $length, $message = null) {
        if (isset($this->data[$field]) && strlen($this->data[$field]) < $length) {
            $this->errors[$field][] = $message ?? "O campo {$field} deve ter pelo menos {$length} caracteres";
        }
        return $this;
    }
    
    /**
     * Validar tamanho máximo
     */
    public function max($field, $length, $message = null) {
        if (isset($this->data[$field]) && strlen($this->data[$field]) > $length) {
            $this->errors[$field][] = $message ?? "O campo {$field} deve ter no máximo {$length} caracteres";
        }
        return $this;
    }
    
    /**
     * Validar se valor está em uma lista
     */
    public function in($field, $values, $message = null) {
        if (isset($this->data[$field]) && !in_array($this->data[$field], $values)) {
            $this->errors[$field][] = $message ?? "Valor inválido para o campo {$field}";
        }
        return $this;
    }
    
    /**
     * Validar username
     */
    public function username($field, $message = null) {
        if (isset($this->data[$field]) && !Helper::validateUsername($this->data[$field])) {
            $this->errors[$field][] = $message ?? "Username deve ter 3-50 caracteres e conter apenas letras, números e underscore";
        }
        return $this;
    }
    
    /**
     * Validar telefone
     */
    public function phone($field, $message = null) {
        // Aceitar apenas dígitos (0-9). Não permitir espaços, sinais ou parênteses.
        if (isset($this->data[$field]) && !preg_match('/^\d+$/', $this->data[$field])) {
            $this->errors[$field][] = $message ?? "Formato de telefone inválido: use apenas números";
        }
        return $this;
    }
    
    /**
     * Validar se é número inteiro
     */
    public function integer($field, $message = null) {
        if (isset($this->data[$field]) && !filter_var($this->data[$field], FILTER_VALIDATE_INT)) {
            $this->errors[$field][] = $message ?? "O campo {$field} deve ser um número inteiro";
        }
        return $this;
    }
    
    /**
     * Validar se é array
     */
    public function array($field, $message = null) {
        if (isset($this->data[$field]) && !is_array($this->data[$field])) {
            $this->errors[$field][] = $message ?? "O campo {$field} deve ser um array";
        }
        return $this;
    }
    
    /**
     * Validação customizada
     */
    public function custom($field, $callback, $message) {
        if (isset($this->data[$field]) && !$callback($this->data[$field])) {
            $this->errors[$field][] = $message;
        }
        return $this;
    }
    
    /**
     * Verificar se há erros
     */
    public function hasErrors() {
        return !empty($this->errors);
    }
    
    /**
     * Obter erros
     */
    public function getErrors() {
        return $this->errors;
    }
    
    /**
     * Obter primeiro erro de um campo
     */
    public function getFirstError($field = null) {
        if ($field) {
            return isset($this->errors[$field]) ? $this->errors[$field][0] : null;
        }
        
        foreach ($this->errors as $fieldErrors) {
            return $fieldErrors[0];
        }
        
        return null;
    }
    
    /**
     * Limpar erros
     */
    public function clearErrors() {
        $this->errors = [];
        return $this;
    }
}
