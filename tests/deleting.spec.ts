import { test, expect } from "@playwright/test";
import {
  addTodoUsingMainInput,
  getTodosFromMainList,
  getTodosFromJsonList,
  toggleTodoFromMainList,
  deleteTodoFromMainList,
  deleteTodoFromStep2List,
  addTodoUsingStep2Input,
  getTodosFromStep2List,
  clearCompleted,
  isSupprimerCocheresDisplayed,
} from "./IUtilsFunctions.ts"; // adapte le chemin si besoin

const URL = "https://alexdmr.github.io/l3m-2023-2024-angular-todolist/";

test.describe("Suppression des tâches", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // ============================
  // ✅ SUPPRESSION - LISTE PRINCIPALE
  // ============================

  test("On peut supprimer une tâche via la croix dans la liste principale", async ({ page }) => {
    await addTodoUsingMainInput(page, "À supprimer");

    await deleteTodoFromMainList(page, 0);

    const todos = await getTodosFromMainList(page);
    expect(todos.length).toBe(0);
  });

  test("On peut supprimer une tâche en la cochant + bouton 'Supprimer cochées'", async ({ page }) => {
    await addTodoUsingMainInput(page, "Tâche test");

    await toggleTodoFromMainList(page, 0);

    const visibleBefore = await isSupprimerCocheresDisplayed(page);
    expect(visibleBefore).toBe(true);

    await clearCompleted(page);

    const todos = await getTodosFromMainList(page);
    expect(todos.length).toBe(0);

    const visibleAfter = await isSupprimerCocheresDisplayed(page);
    expect(visibleAfter).toBe(false);
  });

  test("On peut supprimer plusieurs tâches en une seule fois avec 'Supprimer cochées'", async ({ page }) => {
    await addTodoUsingMainInput(page, "Tâche 1");
    await addTodoUsingMainInput(page, "Tâche 2");
    await addTodoUsingMainInput(page, "Tâche 3");

    await toggleTodoFromMainList(page, 0);
    await toggleTodoFromMainList(page, 2);

    await clearCompleted(page);

    const todos = await getTodosFromMainList(page);
    expect(todos.length).toBe(1);
    expect(todos[0]).toContain("Tâche 2");
  });

  // ============================
  // ✅ VISIBILITÉ DU BOUTON "SUPPRIMER COCHÉES"
  // ============================

  test("Le bouton 'Supprimer cochées' n’est pas visible si rien n’est coché", async ({ page }) => {
    await addTodoUsingMainInput(page, "Tâche visible");

    const visible = await isSupprimerCocheresDisplayed(page);
    expect(visible).toBe(false);
  });

  test("Le bouton 'Supprimer cochées' apparaît dès qu’une tâche est cochée", async ({ page }) => {
    await addTodoUsingMainInput(page, "Tâche cochée");

    await toggleTodoFromMainList(page, 0);

    const visible = await isSupprimerCocheresDisplayed(page);
    expect(visible).toBe(true);
  });

  test("Le bouton 'Supprimer cochées' disparaît après suppression", async ({ page }) => {
    await addTodoUsingMainInput(page, "Tâche 1");
    await toggleTodoFromMainList(page, 0);

    await clearCompleted(page);

    const visible = await isSupprimerCocheresDisplayed(page);
    expect(visible).toBe(false);
  });

  // ============================
  // ✅ SUPPRESSION - ÉTAPE 2
  // ============================

  test("On peut supprimer une tâche depuis l'Étape 2", async ({ page }) => {
    await addTodoUsingStep2Input(page, "Tâche étape 2");

    let todosStep2 = await getTodosFromStep2List(page);
    expect(todosStep2.length).toBe(1);

    await deleteTodoFromStep2List(page, 0);

    todosStep2 = await getTodosFromStep2List(page);
    expect(todosStep2.length).toBe(0);
  });

  test("Supprimer une tâche dans l’Étape 2 la supprime aussi de la liste principale", async ({ page }) => {
    await addTodoUsingMainInput(page, "Synchronisation");

    let mainTodos = await getTodosFromMainList(page);
    expect(mainTodos.length).toBe(1);

    await deleteTodoFromStep2List(page, 0);

    mainTodos = await getTodosFromMainList(page);
    expect(mainTodos.length).toBe(0);
  });

    test("Toute tâche supprimée est aussi supprimée dans le JSON (Étape 1)", async ({ page }) => {
    await addTodoUsingMainInput(page, "À vérifier dans le JSON");

    let jsonTodos = await getTodosFromJsonList(page);
    expect(jsonTodos.length).toBe(1);
    expect(jsonTodos[0].label).toBe("À vérifier dans le JSON");

    // Suppression via la liste principale
    await deleteTodoFromMainList(page, 0);

    jsonTodos = await getTodosFromJsonList(page);
    expect(jsonTodos.length).toBe(0);
  });

});
