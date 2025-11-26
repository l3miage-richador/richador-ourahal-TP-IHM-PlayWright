import { test, expect, Page } from "@playwright/test";
import {
  addTodoUsingMainInput,
  getTodosFromMainList,
} from "./IUtilsFunctions.ts";

const URL = "https://alexdmr.github.io/l3m-2023-2024-angular-todolist/";

test.describe("Annuler / Refaire (Undo / Redo)", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test("Boutons Annuler/Refaire sont disabled par défaut", async ({ page }) => {
    const undoBtn = page.locator("//button[text()='Annuler']");
    const redoBtn = page.locator("//button[text()='Refaire']");

    await expect(undoBtn).toBeDisabled();
    await expect(redoBtn).toBeDisabled();
  });

  test("Après une action, Annuler devient actif et Refaire reste désactivé", async ({ page }) => {
    const undoBtn = page.locator("//button[text()='Annuler']");
    const redoBtn = page.locator("//button[text()='Refaire']");

    await addTodoUsingMainInput(page, "Tâche 1");

    await expect(undoBtn).toBeEnabled();
    await expect(redoBtn).toBeDisabled();
  });

  test("Undo via bouton et raccourci CTRL+Z fonctionne", async ({ page }) => {
    await addTodoUsingMainInput(page, "Tâche 1");
    const undoBtn = page.locator("//button[text()='Annuler']");

    // Via bouton
    await undoBtn.click();
    let todos = await getTodosFromMainList(page);
    expect(todos.length).toBe(0);

    // Refaire l'ajout pour tester le raccourci
    await addTodoUsingMainInput(page, "Tâche 1");

    // Via raccourci clavier
    await page.keyboard.press("Control+z");
    todos = await getTodosFromMainList(page);
    expect(todos.length).toBe(0);
  });

  test("Redo via bouton et raccourci CTRL+Y fonctionne après Undo", async ({ page }) => {
    await addTodoUsingMainInput(page, "Tâche 1");
    const undoBtn = page.locator("//button[text()='Annuler']");
    const redoBtn = page.locator("//button[text()='Refaire']");

    // Undo
    await undoBtn.click();
    let todos = await getTodosFromMainList(page);
    expect(todos.length).toBe(0);

    // Redo via bouton
    await redoBtn.click();
    todos = await getTodosFromMainList(page);
    expect(todos.length).toBe(1);
    expect(todos[0]).toBe("Tâche 1");

    // Undo et redo via clavier
    await page.keyboard.press("Control+z");
    todos = await getTodosFromMainList(page);
    expect(todos.length).toBe(0);

    await page.keyboard.press("Control+y");
    todos = await getTodosFromMainList(page);
    expect(todos.length).toBe(1);
  });

  test("On peut Annuler plusieurs fois jusqu'à l'état initial", async ({ page }) => {
    await addTodoUsingMainInput(page, "Tâche 1");
    await addTodoUsingMainInput(page, "Tâche 2");

    const undoBtn = page.locator("//button[text()='Annuler']");

    await undoBtn.click();
    let todos = await getTodosFromMainList(page);
    expect(todos.length).toBe(1);

    await undoBtn.click();
    todos = await getTodosFromMainList(page);
    expect(todos.length).toBe(0);
  });

  test("On peut Refaire plusieurs fois jusqu'à l'état le plus récent", async ({ page }) => {
    await addTodoUsingMainInput(page, "Tâche 1");
    await addTodoUsingMainInput(page, "Tâche 2");

    const undoBtn = page.locator("//button[text()='Annuler']");
    const redoBtn = page.locator("//button[text()='Refaire']");

    await undoBtn.click(); // supprime Tâche 2
    await undoBtn.click(); // supprime Tâche 1

    await redoBtn.click();
    let todos = await getTodosFromMainList(page);
    expect(todos.length).toBe(1);
    expect(todos[0]).toBe("Tâche 1");

    await redoBtn.click();
    todos = await getTodosFromMainList(page);
    expect(todos.length).toBe(2);
  });

});
