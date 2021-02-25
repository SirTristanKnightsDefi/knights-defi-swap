import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useMulticallContract } from './useContract'
import ERC20_INTERFACE from '../constants/abis/erc20'

const priceContracts: { milkAddress: string, bnbAddress: string, milkBnbLpAddress: string, busdAddress: string, busdBnbLpAddress: string } = {
  milkAddress: '0x26aB5131DD666B4179aC909926ee3C18eE05E470',
  bnbAddress: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  milkBnbLpAddress: '0xDAC965EcF6f44C95e1934Ce311438C3eFF2a17e6',
  busdAddress: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
  busdBnbLpAddress: '0x1b96b92314c44b159149f7e0303511fb2fc4774f'
}

const useGetPriceData = () => {
  const [data, setData] = useState<number>(0)

  const multicallContract = useMulticallContract();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (multicallContract) {
          const { milkAddress, bnbAddress, milkBnbLpAddress, busdAddress, busdBnbLpAddress } = priceContracts;
          const calls = [
            [bnbAddress, ERC20_INTERFACE.encodeFunctionData("balanceOf", [busdBnbLpAddress])],
            [busdAddress, ERC20_INTERFACE.encodeFunctionData("balanceOf", [busdBnbLpAddress])],
          ];

          const result = await multicallContract.aggregate(calls);
          console.log(result);
          // const [result] = await multicallContract.aggregate(calls);
          const [cakeAmount, busdAmount] = result.map(r => ERC20_INTERFACE.decodeFunctionResult("balanceOf", r));
          const cake = new BigNumber(cakeAmount);
          const busd = new BigNumber(busdAmount);
          const cakePrice = busd.div(cake).toNumber();
          setData(cakePrice)
        }
      } catch (error) {
        console.error('Unable to fetch price data:', error)
      }
    }

    fetchData()
  }, [multicallContract])

  return data
}

export default useGetPriceData
