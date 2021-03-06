pragma solidity ^0.4.21;

/**
 * @title Proxy
 *
 * @dev Implements delegation of calls to other contracts, with proper
 * @dev forwarding of return values and bubbling of failures.
 *
 * @dev Defines a fallback function that delegates all calls to the address
 * @dev returned by the abstract _implementation() internal function.
 */
contract Proxy {
  /**
   * @dev Implemented entirely in _fallback.
   */
  function () payable external {
    _fallback();
  }

  /**
   * @return address of the implementation to which the fallback delegates all calls
   */
  function _implementation() internal view returns (address);

  /**
   * @dev Delegates execution to an implementation contract.
   *
   * @dev This is a low level function that doesn't return to its internal call site.
   * @dev It will return to the external caller whatever the implementation returns.
   *
   * @param implementation address to which we delegate
   */
  function _delegate(address implementation) internal {
    assembly {
      // 0x40 contains the value for the next available free memory pointer.
      let ptr := mload(0x40)
      // Copy msg.data.
      calldatacopy(ptr, 0, calldatasize)
      // Call the implementation.
      // out and outsize are 0 because we don't know the size yet.
      let result := delegatecall(gas, implementation, ptr, calldatasize, 0, 0)
      // Copy the returned data.
      returndatacopy(ptr, 0, returndatasize)

      switch result
      // delegatecall returns 0 on error.
      case 0 { revert(ptr, returndatasize) }
      default { return(ptr, returndatasize) }
    }
  }

  /**
   * @dev Function that is run as the first thing in the fallback function.
   *
   * @dev Can be redefined in derived contracts to add functionality.
   * @dev Redefinitions must call super._willFallback().
   */
  function _willFallback() internal {
  }

  /**
   * @dev Extracted fallback function to enable manual triggering.
   */
  function _fallback() internal {
    _willFallback();
    _delegate(_implementation());
  }
}
