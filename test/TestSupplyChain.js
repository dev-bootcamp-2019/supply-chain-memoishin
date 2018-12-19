// Test for failing conditions in this contracts
// test that every modifier is working

var SupplyChain = artifacts.require('SupplyChain')

contract('SupplyChain', function(accounts) {

    const owner = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]
    const emptyAddress = '0x0000000000000000000000000000000000000000'

    var sku
    const price = 1

    // buyItem

    // test for failure if user does not send enough funds
    it("should fail if user does not send enough value to buy item", async() => {
        const supplyChain = await SupplyChain.deployed()

        var eventEmitted = false

        var event = supplyChain.ForSale()
        await event.watch((err, res) => {
            sku = res.args.sku.toString(10)
            eventEmitted = true
        })

        await supplyChain.addItem("Expensive Item", 5, {from: alice})

        var errorMessage;

        try{
            var result = await supplyChain.buyItem(sku, {from: bob, value: 1});
        }
        catch (error) {
            errorMessage = error.message;
        }

        assert.include(errorMessage, "Check if paid enough", "Paying Less Value for the item should throw error")
        
    })

    // test for purchasing an item that is not for Sale

    it("should fail if item is sold and is being bought", async() => {
        const supplyChain = await SupplyChain.deployed()

        var eventEmitted = false

        var event = supplyChain.ForSale()
        await event.watch((err, res) => {
            sku = res.args.sku.toString(10)
            eventEmitted = true
        })

        await supplyChain.addItem("To be Sold Item", 1, {from: alice})
        await supplyChain.buyItem(sku, {from: bob, value: 1});
        var errorMessage;

        try{
            var result = await supplyChain.buyItem(sku, {from: bob, value: 1});
        }
        catch (error) {
            errorMessage = error.message;
        }
        
        assert.include(errorMessage, "Requires to be For Sale", "Buying an item which is not for sale should throw error")
        
    })

    // shipItem

    // test for calls that are made by not the seller

    it("should fail if ship item call is not made by seller", async() => {
        const supplyChain = await SupplyChain.deployed()

        var eventEmitted = false

        var event = supplyChain.ForSale()
        await event.watch((err, res) => {
            sku = res.args.sku.toString(10)
            eventEmitted = true
        })

        await supplyChain.addItem("To be Shipped Item", 1, {from: alice})
        await supplyChain.buyItem(sku, {from: bob, value: 2});
        var errorMessage;

        try{
            var result = await supplyChain.shipItem(sku, {from: bob});
        }
        catch (error) {
            errorMessage = error.message;
        }

        assert.include(errorMessage, "Checks if sender is correct", "The seller not shipping item should throw exception")
        
    })

    // test for trying to ship an item that is not marked Sold

    it("should fail if item which is not sold is made to be shipped", async() => {
        const supplyChain = await SupplyChain.deployed()

        var eventEmitted = false

        var event = supplyChain.ForSale()
        await event.watch((err, res) => {
            sku = res.args.sku.toString(10)
            eventEmitted = true
        })

        await supplyChain.addItem("To be Shipped Item 2", 1, {from: alice})
        
        var errorMessage;

        try{
            var result = await supplyChain.shipItem(sku, {from: alice});
        }
        catch (error) {
            errorMessage = error.message;
        }
      
        assert.include(errorMessage, "Requires to be Sold", "Selling item which is not marked as sold should throw an error")
        
    })

    // receiveItem

    // test calling the function from an address that is not the buyer

    it("should fail if the receiving account is not buyer", async() => {
        const supplyChain = await SupplyChain.deployed()

        var eventEmitted = false

        var event = supplyChain.ForSale()
        await event.watch((err, res) => {
            sku = res.args.sku.toString(10)
            eventEmitted = true
        })

        await supplyChain.addItem("To be Received Item", 1, {from: alice})
        await supplyChain.buyItem(sku, {from: bob, value: 1});
        await supplyChain.shipItem(sku, {from: alice});
        
        var errorMessage;

        try{
            var result = await supplyChain.receiveItem(sku, {from: accounts[5]});
        }
        catch (error) {
            errorMessage = error.message;
        }
        
        assert.include(errorMessage, "Checks if sender is correct", "The seller not shipping the received item throws error")
        
    })

    // test calling the function on an item not marked Shipped

    it("should fail if attempting to receive item which is not shipped", async() => {
        const supplyChain = await SupplyChain.deployed()

        var eventEmitted = false

        var event = supplyChain.ForSale()
        await event.watch((err, res) => {
            sku = res.args.sku.toString(10)
            eventEmitted = true
        })

        await supplyChain.addItem("To be Received Item 2", 1, {from: alice})
        await supplyChain.buyItem(sku, {from: bob, value: 1});
        
        var errorMessage;

        try{
            var result = await supplyChain.receiveItem(sku, {from: bob});
        }
        catch (error) {
            errorMessage = error.message;
        }

        assert.include(errorMessage, "Requires to be Shipped", "Receiving a not shipped item throws exception")
        
    })

});
