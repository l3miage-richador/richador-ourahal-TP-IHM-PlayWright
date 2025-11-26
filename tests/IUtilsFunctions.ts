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
  const input = page.locator("//h2[text()='Étape 2']/following::form[1]//input");
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
  const item = page.locator(
    `xpath=(//section[contains(@class,'todoapp')]//ul[@class='todo-list']//li)[${index + 1}]`
  );
  const button = page.locator(
    `xpath=(//section[contains(@class,'todoapp')]//ul[@class='todo-list']//li//button[@class='destroy'])[${index + 1}]`
  );

  // Hover the list item so the destroy button becomes visible, then click.
  await item.hover();
  try {
    await button.waitFor({ state: 'visible', timeout: 2000 });
    await button.click();
  } catch (e) {
    // Fallback for headless/CI: force the click if visibility did not appear.
    await button.click({ force: true });
  }
}

/**
 * Supprime un todo de l’Étape 2
 */
export async function deleteTodoFromStep2List(page: Page, index: number): Promise<void> {
  const item = page.locator(`xpath=(//h2[text()='Étape 2']/following-sibling::ul[1]//li)[${index + 1}]`);
  const button = page.locator(
    `xpath=(//h2[text()='Étape 2']/following-sibling::ul[1]//li//button)[${index + 1}]`
  );

  await item.hover();
  try {
    await button.waitFor({ state: 'visible', timeout: 2000 });
    await button.click();
  } catch (e) {
    await button.click({ force: true });
  }
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
  // use contains(@class,'edit') because the input may have multiple classes
  const input = page.locator(
    `xpath=(//section[contains(@class,'todoapp')]//ul[@class='todo-list']//li//input[contains(@class,'edit')])[${index + 1}]`
  );

  // try to open inline editor with a double-click on the label (may be required)
  const label = page.locator(
    `xpath=(//section[contains(@class,'todoapp')]//ul[@class='todo-list']//li//label[@class='texte'])[${index + 1}]`
  );
  await label.dblclick().catch(() => {});

  try {
    // wait shortly for the inline edit input to appear, then fill
    await input.first().waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(newText);
    await input.press('Enter');
  } catch (e) {
    throw new Error(`editTodoInMainList: unable to fill edit input for index=${index} - ${e}`);
  }
}

/**
 * Édite un todo dans la liste de l'Étape 2
 */
export async function editTodoInStep2(page: Page, index: number, newText: string): Promise<void> {
  const input = page.locator(
    `xpath=(//h2[text()='Étape 2']/following-sibling::ul[1]//li//input[@name='newLabel'])[${index + 1}]`
  );

  // click the list item (single click) to activate inline edit if required
  const item = page.locator(`xpath=(//h2[text()='Étape 2']/following-sibling::ul[1]//li)[${index + 1}]`);
  await item.click().catch(() => {});

  try {
    await input.first().waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(newText);
    await input.press('Enter');
  } catch (e) {
    throw new Error(`editTodoInStep2: unable to fill step2 input for index=${index} - ${e}`);
  }
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
  // Prefer a strong inside the todo-count span, but be tolerant:
  // - if the element is missing, return 0
  // - trim whitespace and fallback to parsing any number found inside the span
  const strongLocator = page.locator("xpath=//span[contains(@class,'todo-count')]//strong");
  try {
    if ((await strongLocator.count()) === 0) {
      const span = page.locator("xpath=//span[contains(@class,'todo-count')]");
      if ((await span.count()) === 0) return 0;
      const spanText = (await span.first().innerText()).trim();
      const m = spanText.match(/(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    }

    const text = (await strongLocator.first().innerText()).trim();
    const n = parseInt(text, 10);
    return Number.isNaN(n) ? 0 : n;
  } catch (e) {
    return 0;
  }
}

/**
 * Vérifie si “Supprimer cochées” est visible
 */
export async function isSupprimerCocheresDisplayed(page: Page): Promise<boolean> {
  const button = page.locator("xpath=//button[contains(@class,'clear-completed')]");
  return await button.isVisible();
}