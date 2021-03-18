describe("My First Test", () => {
  it("Visits the app root url", () => {
    cy.visit("/");

    cy.contains("h1", "FX");
    cy.contains("h1", "MASTER");

    cy.get(".select")
      .eq(0)
      .should("have.value", "EUR");
    cy.get(".select")
      .eq(1)
      .should("have.value", "USD");
  });

  it("Makes initial request on page load", () => {
    cy.visit("/");

    cy.request(
      "https://api.exchangeratesapi.io/latest?base=EUR&symbols=USD"
    ).then(response => {
      expect(response)
        .property("status")
        .to.equal(200);
    });
  });

  it("Changes selected currencies", () => {
    cy.visit("/");

    cy.get("select")
      .eq(0)
      .select("AUD");
    cy.get("select")
      .eq(0)
      .should("have.value", "AUD");

    cy.request(
      "https://api.exchangeratesapi.io/latest?base=AUD&symbols=USD"
    ).then(response => {
      expect(response)
        .property("status")
        .to.equal(200);
    });

    cy.get("select")
      .eq(1)
      .select("TRY");
    cy.get("select")
      .eq(1)
      .should("have.value", "TRY");

    cy.request(
      "https://api.exchangeratesapi.io/latest?base=AUD&symbols=TRY"
    ).then(response => {
      expect(response)
        .property("status")
        .to.equal(200);
    });
  });

  it("Changes date", () => {
    cy.visit("/");

    cy.get("[data-cy=date-input]").type("2020-09-07");
    cy.get("[data-cy=date-input]").should("have.value", "2020-09-07");

    cy.request(
      "https://api.exchangeratesapi.io/2020-09-07?base=AUD&symbols=TRY"
    ).then(response => {
      expect(response)
        .property("status")
        .to.equal(200);
    });
  });
});
