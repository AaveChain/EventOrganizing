const EventContract = artifacts.require('EventContract');
const truffleAssert = require('truffle-assertions');


contract('EventContract', (accounts) => {
    let eventContractInstance;

    before(async () => {
        eventContractInstance = await EventContract.deployed();
    });

    it('should create an event', async () => {
        const eventName = 'Test Event';
        const eventDate = Math.floor(Date.now() / 1000) + 3600; // One hour from now
        const eventPrice = web3.utils.toWei('0.1', 'ether');
        const ticketCount = 100;

        await eventContractInstance.createEvent(eventName, eventDate, eventPrice, ticketCount);

        const event = await eventContractInstance.events(0);

        assert.equal(event.organizer, accounts[0], 'Organizer is incorrect');
        assert.equal(event.name, eventName, 'Event name is incorrect');
        assert.equal(event.date, eventDate, 'Event date is incorrect');
        assert.equal(event.price.toString(), eventPrice, 'Event price is incorrect');
        assert.equal(event.ticketCount.toNumber(), ticketCount, 'Ticket count is incorrect');
        assert.equal(event.ticketRemain.toNumber(), ticketCount, 'Remaining ticket count is incorrect');
    });

    it('should allow buying tickets', async () => {
        const eventId = 0;
        const quantity = 3;
        const ticketPrice = web3.utils.toWei('0.1', 'ether');

        const initialBalance = await web3.eth.getBalance(accounts[1]);
        await eventContractInstance.buyTicket(eventId, quantity, { from: accounts[1], value: quantity * ticketPrice });
        const finalBalance = await web3.eth.getBalance(accounts[1]);

        const event = await eventContractInstance.events(eventId);
        const purchasedTickets = await eventContractInstance.tickets(accounts[1], eventId);

        assert.equal(event.ticketRemain.toNumber(), 97, 'Remaining ticket count is incorrect');
        assert.equal(purchasedTickets.toNumber(), 3, 'Purchased ticket count is incorrect');
        assert.isBelow(
            finalBalance - initialBalance,
            0.1 * quantity * 10 ** 18,
            'Account balance not reduced correctly'
        );
    });

    it('should allow transferring tickets', async () => {
        const eventId = 0;
        const quantity = 2;
        const recipient = accounts[2];

        await eventContractInstance.transferTicket(eventId, quantity, recipient, { from: accounts[1] });

        const senderTickets = await eventContractInstance.tickets(accounts[1], eventId);
        const recipientTickets = await eventContractInstance.tickets(recipient, eventId);

        assert.equal(senderTickets.toNumber(), 1, 'Sender ticket count is incorrect');
        assert.equal(recipientTickets.toNumber(), 2, 'Recipient ticket count is incorrect');
    });

    it('should emit the EventDateDebug event', async () => {
      const eventContractInstance = await EventContract.deployed();
      
      const tx = await eventContractInstance.createEvent('Test Event', Math.floor(Date.now() / 1000) + 3600, 100, 10);
  
      // Get the event logs from the transaction receipt
      const logs = tx.receipt.logs;
  
      // Find the log corresponding to EventDateDebug
      const eventLog = logs.find(log => log.event === 'EventDateDebug');
      
      // Extract the date value from the event log
      const dateValue = eventLog.args.date.toNumber();
  
      // Calculate the expected date
      const expectedDate = Math.floor(Date.now() / 1000) + 3600;
  
      assert.equal(dateValue, expectedDate, 'Event date is incorrect');
  });

    it('should prevent transferring more tickets than owned', async () => {
        const eventId = 0;
        const quantity = 5;
        const recipient = accounts[2];

        try {
            await eventContractInstance.transferTicket(eventId, quantity, recipient, { from: accounts[1] });
            assert.fail('Transferring more tickets than owned should fail');
        } catch (error) {
            assert.include(error.message, 'You do not have enough tickets', 'Error message is incorrect');
        }
    });

    const EventContract = artifacts.require('EventContract');
const truffleAssert = require('truffle-assertions'); // Add this line

contract('EventContract', (accounts) => {
  let eventContractInstance;

  before(async () => {
    eventContractInstance = await EventContract.deployed();
  });

  // ... (other test cases)

  it('should prevent buying tickets when the event has already occurred', async () => {
    const eventContractInstance = await EventContract.deployed();

    // Create an event with a past date
    const pastEventDate = Math.floor(Date.now() / 1000) - 3600; // One hour ago
    await truffleAssert.reverts(
      eventContractInstance.createEvent('Past Event', pastEventDate, 100, 10),
      'You can organize an event for a future date'
    );

    // Attempt to buy tickets for the past event
    const eventId = 0; // Use the event created in the previous test
    const quantity = 2;
    const ticketPrice = web3.utils.toWei('0.1', 'ether');

    try {
      await eventContractInstance.buyTicket(eventId, quantity, { from: accounts[1], value: quantity * ticketPrice });
      assert.fail('Buying tickets for a past event should fail');
    } catch (error) {
      assert.include(error.message, 'Event does not exist', 'Error message is incorrect');
    }
  });

  // ... (other test cases)
});

  

    it('should prevent transferring tickets to an address with no tickets', async () => {
        const eventId = 0;
        const quantity = 2;
        const recipient = accounts[3];

        try {
            await eventContractInstance.transferTicket(eventId, quantity, recipient, { from: accounts[1] });
            assert.fail('Transferring tickets to an address with no tickets should fail');
        } catch (error) {
            assert.include(error.message, 'You do not have enough tickets', 'Error message is incorrect');
        }
    });
});
