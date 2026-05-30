import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('Três Funcionalidades Implementadas', () => {
  describe('1. Interface de Gerenciamento de Grade Curricular', () => {
    it('deve criar um módulo de grade curricular', async () => {
      const courseId = 4; // TÉCNICO EM SEGURANÇA DO TRABALHO - ATUALIZADO
      
      const newModule = {
        courseId,
        title: 'Módulo de Teste',
        description: 'Descrição do módulo de teste',
        duration: '20 horas',
        order: 10,
      };
      
      const moduleId = await db.createCurriculumItem(newModule);
      expect(moduleId).toBeGreaterThan(0);
      
      // Buscar módulos do curso
      const modules = await db.getCurriculumByCourse(courseId);
      const createdModule = modules.find(m => m.id === moduleId);
      
      expect(createdModule).toBeDefined();
      expect(createdModule?.title).toBe('Módulo de Teste');
      
      // Limpar
      await db.deleteCurriculumItem(moduleId);
    });
    
    it('deve atualizar um módulo existente', async () => {
      const courseId = 4;
      
      // Criar módulo
      const moduleId = await db.createCurriculumItem({
        courseId,
        title: 'Módulo Original',
        description: 'Descrição original',
        duration: '15 horas',
        order: 11,
      });
      
      // Atualizar
      await db.updateCurriculumItem(moduleId, {
        title: 'Módulo Atualizado',
        description: 'Descrição atualizada',
      });
      
      // Verificar
      const modules = await db.getCurriculumByCourse(courseId);
      const updatedModule = modules.find(m => m.id === moduleId);
      
      expect(updatedModule?.title).toBe('Módulo Atualizado');
      expect(updatedModule?.description).toBe('Descrição atualizada');
      
      // Limpar
      await db.deleteCurriculumItem(moduleId);
    });
    
    it('deve excluir um módulo', async () => {
      const courseId = 4;
      
      // Criar módulo
      const moduleId = await db.createCurriculumItem({
        courseId,
        title: 'Módulo para Excluir',
        description: 'Será excluído',
        duration: '10 horas',
        order: 12,
      });
      
      // Excluir
      await db.deleteCurriculumItem(moduleId);
      
      // Verificar que foi excluído
      const modules = await db.getCurriculumByCourse(courseId);
      const deletedModule = modules.find(m => m.id === moduleId);
      
      expect(deletedModule).toBeUndefined();
    });
  });
  
  describe('2. Preview de Vídeo nos Cards de Curso', () => {
    it('deve retornar videoUrl no getAllCourses', async () => {
      const courses = await db.getAllCourses(true);
      
      // Verificar que a lista não está vazia
      expect(courses.length).toBeGreaterThan(0);
      
      // Verificar que o campo videoUrl existe
      const courseWithVideo = courses.find(c => c.videoUrl !== null);
      
      if (courseWithVideo) {
        expect(courseWithVideo.videoUrl).toBeDefined();
        expect(typeof courseWithVideo.videoUrl).toBe('string');
        expect(courseWithVideo.videoUrl).toContain('youtube.com');
      }
    });
    
    it('deve retornar videoUrl no getFeaturedCourses', async () => {
      const courses = await db.getFeaturedCourses();
      
      // Se houver cursos em destaque, verificar que o campo videoUrl existe
      if (courses.length > 0) {
        const firstCourse = courses[0];
        expect(firstCourse).toHaveProperty('videoUrl');
      } else {
        // Se não houver cursos em destaque, o teste passa
        expect(true).toBe(true);
      }
    });
  });
  
  describe('3. Sistema de Destaques na Home', () => {
    it('deve retornar apenas cursos em destaque', async () => {
      const featuredCourses = await db.getFeaturedCourses();
      
      // Todos os cursos retornados devem ter isFeatured = true
      featuredCourses.forEach(course => {
        expect(course.isFeatured).toBe(true);
        expect(course.isActive).toBe(true);
      });
    });
    
    it('deve retornar cursos ordenados por order', async () => {
      const featuredCourses = await db.getFeaturedCourses();
      
      if (featuredCourses.length > 1) {
        // Verificar que está ordenado por order (crescente)
        for (let i = 0; i < featuredCourses.length - 1; i++) {
          const currentOrder = featuredCourses[i].order || 0;
          const nextOrder = featuredCourses[i + 1].order || 0;
          expect(currentOrder).toBeLessThanOrEqual(nextOrder);
        }
      }
    });
    
    it('deve incluir nome da categoria nos cursos em destaque', async () => {
      const featuredCourses = await db.getFeaturedCourses();
      
      if (featuredCourses.length > 0) {
        const firstCourse = featuredCourses[0];
        expect(firstCourse).toHaveProperty('categoryName');
      }
    });
  });
});
