describe('QA engineer application', () => {
    before(function () {
        cy.request({
            url: 'https://www.userlane.com/careers/',
        })
            .then((response) => {
                expect(response.status).to.eq(200)
                expect(response).to.have.property('headers')
                expect(response.headers).to.have.property('link')
                expect(response.headers.link).to.contain('<https://www.userlane.com/?p=27>; rel=shortlink')
            })
    });

    it('1. Check that position is available', function () {
        cy.visit("https://www.userlane.com/careers/")
        cy.get(`a[href^='#careers']`).click()
        cy.get(`a[href^='#careers']`)
        cy.contains('Career Opportunities').should('be.visible') /*TODO: replace with custom function which considering viewport*/

        cy.get(`a[class^='job-title']`).contains("QA/Test Engineer")
            .then(function (elem) {
                if (elem) {
                    return elem
                } else {
                    throw new Error("There is no QA carreer possibility for now, test should not be executed")
                    //TODO: break chain with success message and passed test
                }
            }).invoke('attr', 'href').as('ancor') // will not be used
        cy.wait(1000)
    })

    it('2. Go to site and apply', function () {
        cy.get(`a[class^='job-title']`).contains("QA/Test Engineer").should($a => {
            expect($a.attr('target'), 'target').to.equal('_blank')
            $a.attr('target', '_self')
        }).click()
        cy.get(`div[data-qa="btn-apply-bottom"] > a`).click();
    });

    it('3. Fill form and submit', function () {
        cy.intercept('POST', `**/apply`, (req) => {
            if (req.body) {
                req.alias = 'application'
            }
        })
        cy.intercept('POST', '/parseResume', (req) => {
            if (req.body) {
                req.alias = 'parsing'
            }
        })

        const WebKitForm = 'file.pdf';
        cy.fixture(WebKitForm, 'binary')
            .then(Cypress.Blob.binaryStringToBlob)
            .then(fileContent => {
                cy.get('#resume-upload-input').attachFile({
                    fileContent,
                    filePath: WebKitForm,
                    mimeType: 'application/pdf',
                    encoding: 'binary',
                }, {allowEmpty: true});
            });
        cy.wait(1000)
        // cy.wait('@parsing').its('response.statusCode').should('be.oneOf', [500, 400, 200])
        //TODO: Investigate problem that fileUpload module put content under one ---WebKitFormBoundary, so Lever rejects resume

        cy.get(`input[name='name']`).type(`John Doe`)
        cy.get(`input[name='email']`).type(`john@doe.test`)
        cy.get(`input[name='phone']`).type(`12332452`)
        cy.get(`input[name='cards[16cd39ca-6520-4ed6-a74c-04f777c0732a][field0]']`).type(`1000000`)
        cy.clickRecaptcha('div[class=\'g-recaptcha\'] > div > div > iframe[src*=\'recaptcha\']') /*will work
        only in test mode*/
        cy.wait(1000)
        cy.get('form').submit()
        cy.wait(1000)
        cy.wait('@application').its('response.statusCode').should('be.oneOf', [200, 302])
        //TODO: actually here we have redirect so should be investigated how to allow it with interception (issued in 6.0.0
    })

    afterEach(function () {
        if (this.currentTest.state === 'failed') {
            Cypress.runner.stop()
        }
    });
});


