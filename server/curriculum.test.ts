import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Curriculum functionality", () => {
  let testCourseId: number;

  beforeAll(async () => {
    // Buscar um curso existente para testar
    const courses = await db.getAllCourses();
    if (courses.length === 0) {
      throw new Error("No courses found in database. Please create a course first.");
    }
    testCourseId = courses[0].id;
  });

  it("should create curriculum items for a course", async () => {
    const curriculumItem = {
      courseId: testCourseId,
      title: "Módulo 1: Introdução à Segurança do Trabalho",
      description: "Conceitos básicos de segurança, legislação e normas regulamentadoras",
      duration: "40 horas",
      order: 1,
    };

    const itemId = await db.createCurriculumItem(curriculumItem);
    expect(itemId).toBeGreaterThan(0);
  });

  it("should retrieve curriculum items by course", async () => {
    const items = await db.getCurriculumByCourse(testCourseId);
    expect(Array.isArray(items)).toBe(true);
    
    if (items.length > 0) {
      expect(items[0]).toHaveProperty("id");
      expect(items[0]).toHaveProperty("courseId");
      expect(items[0]).toHaveProperty("title");
      expect(items[0].courseId).toBe(testCourseId);
    }
  });

  it("should update curriculum item", async () => {
    const items = await db.getCurriculumByCourse(testCourseId);
    
    if (items.length > 0) {
      const itemId = items[0].id;
      await db.updateCurriculumItem(itemId, {
        title: "Módulo 1: Introdução à Segurança do Trabalho - Atualizado",
        duration: "45 horas",
      });

      const updatedItems = await db.getCurriculumByCourse(testCourseId);
      const updatedItem = updatedItems.find(item => item.id === itemId);
      
      expect(updatedItem?.title).toContain("Atualizado");
      expect(updatedItem?.duration).toBe("45 horas");
    }
  });

  it("should delete curriculum item", async () => {
    const itemsBefore = await db.getCurriculumByCourse(testCourseId);
    
    if (itemsBefore.length > 0) {
      const itemId = itemsBefore[0].id;
      await db.deleteCurriculumItem(itemId);

      const itemsAfter = await db.getCurriculumByCourse(testCourseId);
      const deletedItem = itemsAfter.find(item => item.id === itemId);
      
      expect(deletedItem).toBeUndefined();
    }
  });

  it("should handle video URL in course", async () => {
    const courses = await db.getAllCourses();
    const course = courses[0];
    
    // Verificar se o campo videoUrl existe no schema
    expect(course).toHaveProperty("videoUrl");
    
    // VideoUrl pode ser null ou string
    if (course.videoUrl) {
      expect(typeof course.videoUrl).toBe("string");
    }
  });
});
