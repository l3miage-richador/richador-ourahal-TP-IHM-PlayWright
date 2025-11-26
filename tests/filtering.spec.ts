import { test, expect } from "@playwright/test";
import {
  addTodoUsingMainInput,
  getTodosFromMainList,
  toggleTodoFromMainList,
  filterAll,
  filterActive,
  filterCompleted,
} from "./IUtilsFunctions.ts";

const URL = "https://alexdmr.github.io/l3m-2023-2024-angular-todolist/";

test.describe("Filtrage des tâches (Tous / Actifs / Complétés)", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // ✅ NOUVEAU TEST — VISIBILITÉ INITIALE DES FILTRES
  test("Les boutons de filtres ne doivent pas exister tant qu'il n’y a aucune tâche", async ({ page }) => {
    const all = page.locator("//a[contains(@class,'filterAll')]");
    const active = page.locator("//a[contains(@class,'filterActives')]");
    const completed = page.locator("//a[contains(@class,'filterCompleted')]");

    await expect(all).toHaveCount(0);
    await expect(active).toHaveCount(0);
    await expect(completed).toHaveCount(0);
  });

  // ✅ NOUVEAU TEST — APPARITION DES FILTRES APRÈS AJOUT
  test("Les boutons de filtres apparaissent dès qu’une tâche est ajoutée", async ({ page }) => {
    await addTodoUsingMainInput(page, "Première tâche");

    const all = page.locator("//a[contains(@class,'filterAll')]");
    const active = page.locator("//a[contains(@class,'filterActives')]");
    const completed = page.locator("//a[contains(@class,'filterCompleted')]");

    await expect(all).toHaveCount(1);
    await expect(active).toHaveCount(1);
    await expect(completed).toHaveCount(1);
  });

  test("Le filtre 'Tous' affiche toutes les tâches", async ({ page }) => {
    await addTodoUsingMainInput(page, "Tâche 1");
    await addTodoUsingMainInput(page, "Tâche 2");

    await toggleTodoFromMainList(page, 0); // Tâche 1 cochée

    await filterAll(page);

    const todos = await getTodosFromMainList(page);
    expect(todos.length).toBe(2);
  });

  test("Le filtre 'Actifs' affiche uniquement les tâches non cochées", async ({ page }) => {
    await addTodoUsingMainInput(page, "Tâche Active");
    await addTodoUsingMainInput(page, "Tâche Complétée");

    await toggleTodoFromMainList(page, 1); // coche la 2e

    await filterActive(page);
    const visibles = await getTodosFromMainList(page);

    expect(visibles.length).toBe(1);
    expect(visibles[0]).toContain("Tâche Active");
  });

  test("Le filtre 'Complétés' affiche uniquement les tâches cochées", async ({ page }) => {
    await addTodoUsingMainInput(page, "A faire");
    await addTodoUsingMainInput(page, "Déjà fait");

    await toggleTodoFromMainList(page, 1); // coche la 2e

    await filterCompleted(page);
    const visibles = await getTodosFromMainList(page);

    expect(visibles.length).toBe(1);
    expect(visibles[0]).toContain("Déjà fait");
  });

  test("Plusieurs tâches cochées sont visibles dans 'Complétés'", async ({ page }) => {
    await addTodoUsingMainInput(page, "Tâche 1");
    await addTodoUsingMainInput(page, "Tâche 2");
    await addTodoUsingMainInput(page, "Tâche 3");

    await toggleTodoFromMainList(page, 0);
    await toggleTodoFromMainList(page, 2);

    await filterCompleted(page);
    const visibles = await getTodosFromMainList(page);

    expect(visibles.length).toBe(2);
    expect(visibles).toContain("Tâche 1");
    expect(visibles).toContain("Tâche 3");
  });

  test("Alterner Tous → Actifs → Complétés fonctionne correctement", async ({ page }) => {
    await addTodoUsingMainInput(page, "Active 1");
    await addTodoUsingMainInput(page, "Complétée 1");

    await toggleTodoFromMainList(page, 1);

    await filterActive(page);
    let visibles = await getTodosFromMainList(page);
    expect(visibles.length).toBe(1);
    expect(visibles[0]).toContain("Active 1");

    await filterCompleted(page);
    visibles = await getTodosFromMainList(page);
    expect(visibles.length).toBe(1);
    expect(visibles[0]).toContain("Complétée 1");

    await filterAll(page);
    visibles = await getTodosFromMainList(page);
    expect(visibles.length).toBe(2);
  });

  test("Le bouton 'Actifs' possède bien la classe 'selected'", async ({ page }) => {
    await addTodoUsingMainInput(page, "Test");
    await filterActive(page);

    const actifSelected = await page.locator(
      "//a[contains(@class,'filterActives') and contains(@class,'selected')]"
    ).count();

    expect(actifSelected).toBe(1);
  });

  test("Le bouton 'Complétés' reçoit la classe 'selected' quand on clique dessus", async ({ page }) => {
    await addTodoUsingMainInput(page, "Test");
    await filterCompleted(page);

    const completedSelected = await page.locator(
      "//a[contains(@class,'filterCompleted') and contains(@class,'selected')]"
    ).count();

    expect(completedSelected).toBe(1);
  });

});
