describe('Clients', () => {
    beforeEach(() => {
        cy.visit('/onboarding');
        // cy.wait(10000)

    });
    
    
it('Should upload Upload Company Profile Image', () => {
    cy.contains("Upload Company Profile Image")
    .should('be.visible')

    const fileName = 'images.png';
    cy.get('input[type="file"]').attachFile(fileName);
    cy.get('#continueButton').click()

    ////////////////////step 2/////////////////////////
    
    cy.contains("What is the size of your company?")
    .should('be.visible')

    cy.contains('11-50')
    .should('be.visible')
    .click()

    cy.contains("What is your industry?")
    .should('be.visible')

    cy.contains('IT Company')
    .should('be.visible')
    .click()

    cy.get('#continueButton').click()

    ////////////////////step 3/////////////////////////

    cy.contains("Fiscal Year Name")
    .should('be.visible')
    cy.get("#name").type("IE Test")

    cy.contains("Description")
    .should('be.visible')
    cy.get("#description").type("IE Description")

    cy.contains("Fiscal Year Starting Date")
    .should('be.visible')
    cy.get('input[id="startDate"]').should('be.visible').type('2024-11-12');

    cy.contains("Fiscal Year End Date")
    .should('be.visible')
    cy.get('input[id="endDate"]').should('be.visible').type('2025-11-13');
    cy.wait(200)

    cy.contains('We').click()

    cy.get('#continueButton').click()
    
    
    ////////////////////step 4/////////////////////////

    cy.contains("Schedule Name")
    .should('be.visible')
    cy.get("#name").type("Work Schedule")

    cy.contains("Standard working hours/day")
    .should('be.visible')
    cy.get("#standardHours").type("8")

    cy.contains("Monday")
    .should('be.visible')
    cy.get("#MondaySwitchId").click()


    cy.selectTime('Monday-start', '07', '30', 'AM');
    cy.selectTime('Monday-end', '05', '30', 'PM');

    cy.contains("Tuesday")
    .should('be.visible')
    cy.get("#TuesdaySwitchId").click()
    cy.selectTime('Tuesday-start', '07', '30', 'AM');
    cy.selectTime('Tuesday-end', '05', '30', 'PM');

    cy.contains("Wednesday")
    .should('be.visible')
    cy.get("#WednesdaySwitchId").click()
    cy.selectTime('Wednesday-start', '07', '30', 'AM');
    cy.selectTime('Wednesday-end', '05', '30', 'PM');

    cy.contains("Thursday")
    .should('be.visible')
    cy.get("#ThursdaySwitchId").click()
    cy.selectTime('Thursday-start', '07', '30', 'AM');
    cy.selectTime('Thursday-end', '05', '30', 'PM');

    cy.contains("Friday")
    .should('be.visible')
    cy.get("#FridaySwitchId").click()
    cy.selectTime('Friday-start', '07', '30', 'AM');
    cy.selectTime('Friday-end', '05', '30', 'PM');

    cy.contains("Saturday")
    .should('be.visible')
    cy.get("#SaturdaySwitchId").click()
    cy.selectTime('Saturday-start', '07', '00', 'AM');
    cy.selectTime('Saturday-end', '11', '30', 'AM');

    cy.get('#continueButton').click()

    
    ////////////////////step 5/////////////////////////

    cy.contains("Branches")
    .should('be.visible')

    cy.contains("Add New")
    .should('be.visible')
    .click()

    cy.get("#cancelCreateBranchButton").click()

    // cy.contains("Add New")
    // .should('be.visible')
    // .click()

    // cy.contains("Branch Name")
    // .should('be.visible')
    // cy.get("#name").type("Test Branch")

    // cy.contains("Branch Description")
    // .should('be.visible')
    // cy.get("#description").type("Test Branch Description")

    // cy.contains("Location")
    // .should('be.visible')
    // cy.get("#location").type("Addis Ababa")

    // cy.contains("Contact Number")
    // .should('be.visible')
    // cy.get("#contactNumber").type("0923343434")

    // cy.contains("Contact Email")
    // .should('be.visible')
    // cy.get("#contactEmail").type("test@test.com")

    // cy.get("#createBranchButton").click()

     cy.get('#continueButton').click()

    
    ////////////////////step 6/////////////////////////

    cy.contains("Make to your Organization Detail?")
    .should('be.visible')

    cy.contains("CEO")
    .should('be.visible')
    
    cy.get("#ceoButton").click()

    // cy.contains("Branches")
    // .should('be.visible')

    cy.contains("Add Department")
    .should('be.visible')
    
    cy.get("#name").type("COS")

    // cy.selectDropdown("#branchId", "HQ")
    cy.selectBranch('Test Branch');
    cy.get("#description").type("Chief of Staff Description")

    cy.get("#createDepartmentButton").click()

    /////////////////////////2///////////////////

      cy.get("#ceoButton").click()

    // cy.contains("Branches")
    // .should('be.visible')

    cy.contains("Add Department")
    .should('be.visible')
    
    cy.get("#name").type("COF")


    cy.selectBranch('a');
    cy.get("#description").type("Chief of Finance Description")

    cy.get("#createDepartmentButton").click()

    //////////////////////////3///////////////////

    cy.get("#COSButton").click()

    cy.contains("Add Department")
    .should('be.visible')
    
    cy.get("#name").type("Operation")
    cy.selectBranch('Test Branch');
    cy.get("#description").type("Operation description")

    cy.get("#createDepartmentButton").click()


    //////////////////////////4///////////////////

    cy.get("#COFButton").click()

    cy.contains("Add Department")
    .should('be.visible')
    
    cy.get("#name").type("Controller")
    cy.selectBranch('Test Branch');
    cy.get("#description").type("Controller description")

    cy.get("#createDepartmentButton").click()

    //////////////////////////5///////////////////

    cy.get("#COFButton").click()

    cy.contains("Add Department")
    .should('be.visible')
    
    cy.get("#name").type("finance")
    cy.selectBranch('Test Branch');
    cy.get("#description").type("Controller description")

    cy.get("#createDepartmentButton").click()

    

        //////////////////////////6///////////////////

    cy.get("#COSButton").click()

    cy.contains("Add Department")
    .should('be.visible')
    
    cy.get("#name").type("PM")
    cy.selectBranch('Test Branch');
    cy.get("#description").type("Project manager description")

    cy.get("#createDepartmentButton").click()




    cy.get("#finishButton").click()

  });
    
});