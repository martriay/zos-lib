'use strict';

import assertRevert from '../../helpers/assertRevert'
import shouldBehaveLikeOwnable from './Ownable'

export default function shouldBehaveLikeImplementationDirectory(owner, anotherAddress) {
  describe('ownership', function () {
    beforeEach(function () {
      this.ownable = this.directory
    })

    shouldBehaveLikeOwnable(owner, anotherAddress)
  })

  describe('setImplementation', function () {
    const ZERO_ADDRESS = 0x0
    const contractName = 'ERC721'

    describe('when the sender is the directory owner', function () {
      const from = owner

      it('registers the given contract', async function () {
        await this.directory.setImplementation(contractName, this.implementation_v0, { from })

        const registeredImplementation = await this.directory.getImplementation(contractName)
        assert.equal(registeredImplementation, this.implementation_v0)
      })

      it('emits an event', async function () {
        const { logs } = await this.directory.setImplementation(contractName, this.implementation_v0, { from })

        assert.equal(logs.length, 1)
        assert.equal(logs[0].event, 'ImplementationChanged')
        assert.equal(logs[0].args.contractName, contractName)
        assert.equal(logs[0].args.implementation, this.implementation_v0)
      })

      it('allows to register a another implementation of the same contract', async function () {
        await this.directory.setImplementation(contractName, this.implementation_v0, { from })
        await this.directory.setImplementation(contractName, this.implementation_v1, { from })

        const registeredImplementation = await this.directory.getImplementation(contractName)
        assert.equal(registeredImplementation, this.implementation_v1)
      })

      it('allows to register another contract', async function () {
        const anotherContract = 'anotherContract';
        await this.directory.setImplementation(anotherContract, this.implementation_v1, { from })

        const registeredImplementation = await this.directory.getImplementation(anotherContract)
        assert.equal(registeredImplementation, this.implementation_v1)
      })

      it('allows to unregister a contract', async function () {
        await this.directory.setImplementation(contractName, this.implementation_v0, { from })
        await this.directory.setImplementation(contractName, ZERO_ADDRESS, { from })

        const registeredImplementation = await this.directory.getImplementation(contractName)
        assert.equal(registeredImplementation, ZERO_ADDRESS)
      })
    })

    describe('when the sender is not the directory owner', function () {
      const from = anotherAddress

      it('reverts', async function () {
        await assertRevert(this.directory.setImplementation(contractName, this.implementation_v0, { from }))
      })
    })
  })
}
