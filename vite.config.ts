import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // o AI Studio desativa o HMR com essa variável aqui
      // nem mexe nisso pra não ficar piscando a tela quando salvar código
      hmr: process.env.DISABLE_HMR !== 'true',
      // desliga o monitor de arquivos se tiver ativado pra não fritar o processador
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
