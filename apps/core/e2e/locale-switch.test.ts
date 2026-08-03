import { expect, test } from "@playwright/test";

test("keeps selected locale when navigating back to home via logo", async ({
  page,
}) => {
  await page.goto("/de-CH/log-in");
  await expect(page).toHaveURL(/\/de-CH\/log-in/);

  const languageSwitcher = page.locator(
    'nav[aria-label="Language selection"] [data-select-trigger]',
  );
  await languageSwitcher.click();
  await languageSwitcher.press("Home");
  await languageSwitcher.press("ArrowDown");
  await languageSwitcher.press("ArrowDown");
  await languageSwitcher.press("Enter");
  await expect(page).toHaveURL(/\/fr-CH\/log-in/);

  await page.locator("header #title").click();

  await expect(page).toHaveURL("/fr-CH");
  await expect(page.locator("h1")).toHaveText(
    "Comment demander à vos conteneurs: «Tout va bien?»",
  );
});
