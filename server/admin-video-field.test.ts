import { describe, it, expect } from 'vitest';

describe('Admin Video Field Tests', () => {
  it('deve validar formatos de URL do YouTube', () => {
    const youtubePattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
    
    // URLs válidas
    expect(youtubePattern.test('https://www.youtube.com/watch?v=ScMzIvxBSi4')).toBe(true);
    expect(youtubePattern.test('https://youtu.be/ScMzIvxBSi4')).toBe(true);
    expect(youtubePattern.test('https://www.youtube.com/embed/ScMzIvxBSi4')).toBe(true);
    expect(youtubePattern.test('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    
    // URLs inválidas
    expect(youtubePattern.test('https://exemplo.com/video')).toBe(false);
    expect(youtubePattern.test('https://vimeo.com/123456')).toBe(false);
    expect(youtubePattern.test('not a url')).toBe(false);
    expect(youtubePattern.test('')).toBe(false);
  });

  it('deve validar formatos de URL do Vimeo', () => {
    const vimeoPattern = /vimeo\.com\/(\d+)/;
    
    // URLs válidas
    expect(vimeoPattern.test('https://vimeo.com/123456789')).toBe(true);
    expect(vimeoPattern.test('https://www.vimeo.com/987654321')).toBe(true);
    expect(vimeoPattern.test('http://vimeo.com/111222333')).toBe(true);
    
    // URLs inválidas
    expect(vimeoPattern.test('https://exemplo.com/video')).toBe(false);
    expect(vimeoPattern.test('https://youtube.com/watch?v=abc')).toBe(false);
    expect(vimeoPattern.test('https://vimeo.com/notanumber')).toBe(false);
    expect(vimeoPattern.test('')).toBe(false);
  });

  it('deve converter URL do YouTube para formato embed', () => {
    const convertToEmbed = (url: string): string | null => {
      const youtubePattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
      const match = url.match(youtubePattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
      return null;
    };

    expect(convertToEmbed('https://www.youtube.com/watch?v=ScMzIvxBSi4'))
      .toBe('https://www.youtube.com/embed/ScMzIvxBSi4');
    
    expect(convertToEmbed('https://youtu.be/ScMzIvxBSi4'))
      .toBe('https://www.youtube.com/embed/ScMzIvxBSi4');
    
    expect(convertToEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ'))
      .toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    
    expect(convertToEmbed('https://exemplo.com/video'))
      .toBeNull();
  });

  it('deve converter URL do Vimeo para formato embed', () => {
    const convertToEmbed = (url: string): string | null => {
      const vimeoPattern = /vimeo\.com\/(\d+)/;
      const match = url.match(vimeoPattern);
      if (match && match[1]) {
        return `https://player.vimeo.com/video/${match[1]}`;
      }
      return null;
    };

    expect(convertToEmbed('https://vimeo.com/123456789'))
      .toBe('https://player.vimeo.com/video/123456789');
    
    expect(convertToEmbed('https://www.vimeo.com/987654321'))
      .toBe('https://player.vimeo.com/video/987654321');
    
    expect(convertToEmbed('https://exemplo.com/video'))
      .toBeNull();
  });

  it('deve rejeitar URLs inválidas', () => {
    const youtubePattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
    const vimeoPattern = /vimeo\.com\/(\d+)/;
    
    const invalidUrl = 'https://exemplo.com/video-invalido';
    
    const isValid = youtubePattern.test(invalidUrl) || vimeoPattern.test(invalidUrl);
    expect(isValid).toBe(false);
  });

  it('deve aceitar URLs válidas do YouTube e Vimeo', () => {
    const youtubePattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
    const vimeoPattern = /vimeo\.com\/(\d+)/;
    
    const validYoutubeUrl = 'https://www.youtube.com/watch?v=ScMzIvxBSi4';
    const validVimeoUrl = 'https://vimeo.com/123456789';
    
    expect(youtubePattern.test(validYoutubeUrl) || vimeoPattern.test(validYoutubeUrl)).toBe(true);
    expect(youtubePattern.test(validVimeoUrl) || vimeoPattern.test(validVimeoUrl)).toBe(true);
  });

  it('deve extrair ID do vídeo do YouTube corretamente', () => {
    const extractYoutubeId = (url: string): string | null => {
      const youtubePattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
      const match = url.match(youtubePattern);
      return match ? match[1] : null;
    };

    expect(extractYoutubeId('https://www.youtube.com/watch?v=ScMzIvxBSi4')).toBe('ScMzIvxBSi4');
    expect(extractYoutubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYoutubeId('https://www.youtube.com/embed/abc123def45')).toBe('abc123def45');
    expect(extractYoutubeId('https://exemplo.com/video')).toBeNull();
  });

  it('deve extrair ID do vídeo do Vimeo corretamente', () => {
    const extractVimeoId = (url: string): string | null => {
      const vimeoPattern = /vimeo\.com\/(\d+)/;
      const match = url.match(vimeoPattern);
      return match ? match[1] : null;
    };

    expect(extractVimeoId('https://vimeo.com/123456789')).toBe('123456789');
    expect(extractVimeoId('https://www.vimeo.com/987654321')).toBe('987654321');
    expect(extractVimeoId('https://exemplo.com/video')).toBeNull();
  });
});
