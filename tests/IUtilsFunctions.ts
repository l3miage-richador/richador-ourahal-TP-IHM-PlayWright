import { Page } from "@playwright/test";

/* ---------------------- AJOUT DE TODOS ----------------------- */

/**
 * Ajoute un todo grâce au champ texte principal (Étape 1)
 */
export async function addTodoUsingMainInput(page: Page, text: string): Promise<void> {
  const input = page.locator("xpath=//section[contains(@class,'todoapp')]//input[@class='new-todo']");
  await input.fill(text);
  await input.press("Enter");
}

/**
 * Ajoute un todo grâce au champ texte de l’Étape 2
 */
export async function addTodoUsingStep2Input(page: Page, text: string): Promise<void> {
  const input = page.locator(
    "xpath=//h2[text()='Étape 2']/following-sibling::ul[1]//input[@type='text']"
  );
  await input.fill(text);
  await input.press("Enter");
}

/* ---------------------- RÉCUPÉRATION DE TODOS ----------------------- */

/**
 * Retourne la liste des todos dans la liste principale
 */
export async function getTodosFromMainList(page: Page): Promise<string[]> {
  const labels = page.locator(
    "xpath=//section[contains(@class,'todoapp')]//ul[@class='todo-list']//li//label[@class='texte']"
  );
  return await labels.evaluateAll((els) => els.map((el) => (el as HTMLLabelElement).innerText));
}

/**
 * Retourne la liste des todos dans l’Étape 2
 */
export async function getTodosFromStep2List(page: Page): Promise<string[]> {
  const inputs = page.locator(
    "xpath=//h2[text()='Étape 2']/following-sibling::ul[1]//input[@name='newLabel']"
  );
  return await inputs.evaluateAll((els) => els.map((el) => (el as HTMLInputElement).value));
}

/**
 * Retourne les todos présents dans la zone JSON (Étape 1)
 */
export async function getTodosFromJsonList(page: Page): Promise<{ label: string; done: boolean; uid: number }[]> {
  const jsonText = await page.locator("xpath=//h2[text()='Étape 1']/following-sibling::pre[1]").innerText();
  const json = JSON.parse(jsonText);
  return json.items;
}

/* ---------------------- TOGGLE (COCHER/DÉCOCHER) ----------------------- */

/**
 * Coche/décocher une tâche dans la liste principale
 */
export async function toggleTodoFromMainList(page: Page, index: number): Promise<void> {
  const checkbox = page.locator(
    `xpath=(//section[contains(@class,'todoapp')]//ul[@class='todo-list']//li//input[@type='checkbox'])[${index + 1}]`
  );
  await checkbox.click();
}

/**
 * Coche/décocher une tâche dans l’Étape 2
 */
export async function toggleTodoFromStep2List(page: Page, index: number): Promise<void> {
  const checkbox = page.locator(
    `xpath=(//h2[text()='Étape 2']/following-sibling::ul[1]//li//input[@type='checkbox'])[${index + 1}]`
  );
  await checkbox.click();
}

/* ---------------------- SUPPRESSION ----------------------- */

/**
 * Supprime un todo de la liste principale
 */
export async function deleteTodoFromMainList(page: Page, index: number): Promise<void> {
  const button = page.locator(
    `xpath=(//section[contains(@class,'todoapp')]//ul[@class='todo-list']//li//button[@class='destroy'])[${index + 1}]`
  );
  await button.click();
}

/**
 * Supprime un todo de l’Étape 2
 */
export async function deleteTodoFromStep2List(page: Page, index: number): Promise<void> {
  const button = page.locator(
    `xpath=(//h2[text()='Étape 2']/following-sibling::ul[1]//li//button)[${index + 1}]`
  );
  await button.click();
}

/* ---------------------- ÉDITION ----------------------- */

/**
 * Édite un todo dans l’Étape 2
 */
export async function editTodoFromStep2(page: Page, index: number, newText: string): Promise<void> {
  const input = page.locator(
    `xpath=(//h2[text()='Étape 2']/following-sibling::ul[1]//li//input[@name='newLabel'])[${index + 1}]`
  );
  await input.fill(newText);
  await input.press("Enter");
}

/**
 * Édite un todo dans la liste principale
 */
export async function editTodoInMainList(page: Page, index: number, newText: string): Promise<void> {
  const input = page.locator(
    `xpath=(//section[contains(@class,'todoapp')]//ul[@class='todo-list']//li//input[@class='edit'])[${index + 1}]`
  );
  await input.fill(newText);
  await input.press("Enter");
}

/* ---------------------- FILTRES ----------------------- */

/**
 * Applique le filtre "Tous"
 */
export async function filterAll(page: Page): Promise<void> {
  const filter = page.locator("xpath=//ul[contains(@class,'filters')]//a[contains(@class,'filterAll')]");
  await filter.click();
}

/**
 * Applique le filtre "Actifs"
 */
export async function filterActive(page: Page): Promise<void> {
  const filter = page.locator("xpath=//ul[contains(@class,'filters')]//a[contains(@class,'filterActives')]");
  await filter.click();
}

/**
 * Applique le filtre "Complétés"
 */
export async function filterCompleted(page: Page): Promise<void> {
  const filter = page.locator("xpath=//ul[contains(@class,'filters')]//a[contains(@class,'filterCompleted')]");
  await filter.click();
}

/* ---------------------- ACTIONS GLOBALES ----------------------- */

/**
 * Supprime toutes les tâches cochées via le bouton “Supprimer cochées”
 */
export async function clearCompleted(page: Page): Promise<void> {
  const button = page.locator("xpath=//button[contains(@class,'clear-completed')]");
  await button.click();
}

/**
 * Retourne le nombre affiché de tâches restantes
 */
export async function countRemaining(page: Page): Promise<number> {
  const text = await page.locator("xpath=//span[contains(@class,'todo-count')]/strong").innerText();
  return parseInt(text, 10);
}

/**
 * Vérifie si “Supprimer cochées” est visible
 */
export async function isSupprimerCocheresDisplayed(page: Page): Promise<boolean> {
  const button = page.locator("xpath=//button[contains(@class,'clear-completed')]");
  return await button.isVisible();
}
