const Cars = artifacts.require('Cars');

const BN = web3.utils.BN;

contract('Cars - events', (accounts) => {

  before(async () => {
    // set up contract with relevant initial state
    const instance = await Cars.deployed();

    await instance.addCar(
      '0xff00ff', // colour: purple
      new BN(4), // doors: 4
      new BN(0), // distance: 0
      new BN(0), // lat: 0
      new BN(0), // lon: 0
      {
        from: accounts[1],
        value: web3.utils.toWei('0.11', 'ether'),
      },
    );

    await instance.addCar(
      '0xffff00', // colour: yellow
      new BN(2), // doors: 2
      new BN(0), // distance: 0
      new BN(0), // lat: 0
      new BN(0), // lon: 0
      {
        from: accounts[2],
        value: web3.utils.toWei('0.11', 'ether'),
      },
    );

    // just a sanity check, we do not really need to do assertions
    // within the set up, as this should be for "known working state"
    // only
    const numCars =
      await instance.numCars.call();
    assert.equal(numCars.toString(), '2');
  });

  it('Honks a car at another car', async () => {
    const instance = await Cars.deployed();

    // perform the state transition
    const tx =
      await instance.honkCar(
        2,
        1,
        {
          // account #2 owns car #2
          from: accounts[2],
        },
      );

      // inspect the transaction & perform assertions on the logs
      const { logs } = tx;
      console.log(logs);
      assert.ok(Array.isArray(logs));
      assert.equal(logs.length, 1);

      const log = logs[0];
      assert.equal(log.event, 'CarHonk');
      assert.equal(log.args.fromCar.toString(), '2');
      assert.equal(log.args.atCar.toString(), '1');
  });

  it('Honking a car that you do not own is not allowed', async () => {
    const instance = await Cars.deployed();
    // perform the state transition
    let tx;
    let err;
    try {
      tx =
        await instance.honkCar(
          2,
          1,
          {
            // account #3 does not own any cars, only account #1 and #2 do
            from: accounts[3],
          },
        );
    } catch (ex) {
      err = ex;
    }

    // should not get a result, but an error should have been thrown
    assert.ok(err);
    assert.ok(!tx);

    // check that the error reason is what you expect
    assert.equal(err.reason, 'you need to own this car');
  });

});
