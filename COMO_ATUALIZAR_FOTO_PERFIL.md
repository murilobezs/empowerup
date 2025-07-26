# 📸 Como Atualizar sua Foto de Perfil

## 🚀 Funcionalidades Disponíveis

Agora você pode atualizar sua foto de perfil de várias maneiras no sistema EmpowerUp:

### 1. **Página de Edição de Perfil** (`/editar-perfil`)
- Avatar grande e visível
- Botão "Alterar foto" que expande a área de upload
- Upload por clique ou arrastar e soltar
- Preview da imagem antes de salvar

### 2. **Página Meu Perfil** (`/meu-perfil`)
- Modal de edição com seção dedicada para foto
- Avatar no topo do modal
- Upload integrado ao formulário de edição

### 3. **Página Perfil Simples** (`/perfil-simples`)
- Interface limpa e intuitiva
- Foco na experiência do usuário
- Feedback visual imediato

### 4. **Página Editar Perfil Completo** (`/editar-perfil-completo`) ⭐ **NOVA!**
- Layout em página completa (sem modal)
- Área dedicada para foto de perfil
- Melhor experiência em dispositivos móveis
- **Solução para problemas de scroll!**

## 🎯 Como Usar

### Passo a Passo:

1. **Acesse sua página de perfil**
   - Vá para `/editar-perfil` ou `/meu-perfil`

2. **Clique em "Alterar foto"**
   - O componente de upload será exibido

3. **Selecione sua imagem**
   - **Clique** na área de upload para selecionar arquivo
   - **Arraste e solte** uma imagem diretamente
   - **Formatos aceitos**: JPG, PNG, GIF, WebP
   - **Tamanho máximo**: 5MB

4. **Visualize o preview**
   - A imagem será exibida imediatamente
   - Você pode cancelar se não gostar

5. **Confirme o upload**
   - A imagem será enviada automaticamente
   - Você verá uma mensagem de sucesso

## 🔧 Configuração Técnica

### No seu componente React:

```jsx
import ImageUpload from "../components/ImageUpload"

const MeuComponente = () => {
  const [avatar, setAvatar] = useState("/placeholder.svg")

  const handleImageUpload = (imagePath) => {
    setAvatar(imagePath)
    alert("Foto atualizada!")
  }

  return (
    <div>
      <Avatar className="w-32 h-32">
        <AvatarImage src={avatar} alt="Foto de perfil" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      
      <ImageUpload
        uploadType="user_avatar"
        userId={1} // ID do usuário logado
        onUpload={handleImageUpload}
        currentImage={avatar}
        placeholder="Selecione sua foto de perfil"
      />
    </div>
  )
}
```

### Parâmetros do ImageUpload:

- `uploadType`: Tipo de upload ("user_avatar", "post_image", "group_cover")
- `userId`: ID do usuário (obrigatório para avatar)
- `onUpload`: Função chamada após upload bem-sucedido
- `currentImage`: Imagem atual (para preview)
- `placeholder`: Texto exibido na área de upload

## 📱 Experiência do Usuário

### ✅ Funcionalidades Implementadas:
- **Drag & Drop**: Arrastar e soltar imagens
- **Preview**: Visualização antes do upload
- **Validação**: Verificação de tipo e tamanho
- **Feedback**: Mensagens de sucesso/erro
- **Responsivo**: Funciona em desktop e mobile

### 🎨 Interface:
- **Visual limpo**: Área de upload bem definida
- **Feedback visual**: Loading e estados de sucesso/erro
- **Integração**: Funciona com os componentes de Avatar existentes

## 🔒 Segurança

- **Validação de tipo**: Apenas imagens são aceitas
- **Limite de tamanho**: Máximo 5MB
- **Verificação de arquivo**: Confirma que é uma imagem válida
- **Nomes únicos**: Evita conflitos de arquivo

## 🎯 Próximos Passos

1. **Integrar com autenticação**: Usar dados do usuário logado
2. **Adicionar redimensionamento**: Otimizar tamanho das imagens
3. **Crop de imagem**: Permitir recortar a foto
4. **Múltiplos formatos**: Adicionar suporte a mais tipos

---

## 🚀 Começar Agora!

Para testar a funcionalidade:

1. **Modal com scroll corrigido**: `http://localhost:3000/meu-perfil`
2. **Interface simples**: `http://localhost:3000/perfil-simples`
3. **Página completa (RECOMENDADO)**: `http://localhost:3000/editar-perfil-completo`
4. Clique em "Alterar Foto"
5. Selecione uma imagem do seu computador
6. Veja a magia acontecer! ✨

**Divirta-se atualizando sua foto de perfil!** 📸

---

## 🚨 Solução de Problemas

### ❌ **Erro de Conexão ao Enviar Imagem**

Se você estiver recebendo "erro de conexão ao enviar imagem", siga estes passos:

#### 1. **Verificar se o XAMPP está rodando**
- Abra o XAMPP Control Panel
- Certifique-se de que estão **ATIVOS**:
  - ✅ **Apache** (Web Server)
  - ✅ **MySQL** (Database)

#### 2. **Testar a API diretamente**
Acesse: [`http://localhost/empowerup/api/test_upload.php`](http://localhost/empowerup/api/test_upload.php)
- Isso irá verificar permissões e configurações automaticamente

#### 3. **Testar o upload manualmente**
Acesse: [`http://localhost/empowerup/test_upload.html`](http://localhost/empowerup/test_upload.html)
- Interface simples para testar o upload diretamente

#### 4. **Verificar permissões de pasta**
As seguintes pastas devem existir:
```
c:\xampp\htdocs\empowerup\public\images\
c:\xampp\htdocs\empowerup\public\images\pfp\user\
c:\xampp\htdocs\empowerup\public\images\posts\
c:\xampp\htdocs\empowerup\public\images\groups\covers\
```

#### 5. **Verificar a URL da API**
No arquivo `ImageUpload.jsx`, certifique-se de que a URL está correta:
```javascript
fetch('http://localhost/empowerup/api/upload_image.php', {
    method: 'POST',
    body: formData,
});
```

#### 6. **Limpar cache do navegador**
- Pressione `Ctrl + F5` para recarregar completamente
- Ou abra o modo incógnito/privado

### ✅ **Verificação Rápida**

1. **XAMPP rodando?** → Abra XAMPP Control Panel
2. **API funcionando?** → Acesse `http://localhost/empowerup/api/test_upload.php`
3. **Upload funcionando?** → Acesse `http://localhost/empowerup/test_upload.html`

### 🆘 **Outras Soluções**

#### Erro de Permissão
```bash
# No Windows: Clique com botão direito na pasta
# Propriedades → Segurança → Editar → Todos → Controle Total
```

#### Erro de Upload
1. Verifique o tamanho do arquivo (máximo 5MB)
2. Verifique o tipo do arquivo (JPG, PNG, GIF, WebP)
3. Confirme as permissões da pasta

#### Username Não Disponível
1. Tente variações do username
2. Use o botão "Gerar" para sugestões automáticas
3. Adicione números ou underscores

---

## 📞 **Precisa de Ajuda?**

Se ainda estiver com problemas:

1. **Verifique os logs do servidor PHP** (XAMPP Control Panel → Apache → Logs)
2. **Abra o console do navegador** (F12 → Console)
3. **Confirme a configuração do banco de dados**
4. **Execute o teste de diagnóstico**: `http://localhost/empowerup/api/test_upload.php`

**Agora você deve conseguir atualizar sua foto de perfil sem problemas! 🎉**
