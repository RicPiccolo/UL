import 'cypress-file-upload';

Cypress.Commands.add("getByTestSelector", (selector, ...args) => {
    return cy.get(`[data-qa=${selector}]`, ...args);
});

Cypress.Commands.add("clickRecaptcha", (selector) => {
    cy.wait(500)
    cy.window().then(win => {
        win.document
            .querySelector(selector)
            .contentDocument.getElementById("recaptcha-token")
            .click();
    });
});
