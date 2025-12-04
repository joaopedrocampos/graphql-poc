# Usar imagem Node.js oficial como base
FROM node:20-alpine

# Criar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro (para cache do Docker)
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código da aplicação
COPY . .

# Compilar TypeScript
RUN npm run build

# Expor porta da aplicação
EXPOSE 8000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
