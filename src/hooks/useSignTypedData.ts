import { useSignTypedData } from 'wagmi';
import  API  from '../providers/axios';

// Permit2 EIP-712 types (standard)
const PERMIT2_TYPES = {
  PermitTransferFrom: [
    { name: 'permitted', type: 'TokenPermissions' },
    { name: 'spender', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
  TokenPermissions: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
};

const PERMIT2_CONTRACT = '0x000000000022D473030F116dDEE9F6B43aC78BA3';