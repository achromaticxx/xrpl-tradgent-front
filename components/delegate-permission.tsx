// xrpl-tradgent-front/components/delegate-permission.tsx
"use client"

import { useState, useEffect } from 'react';
import sdk from '@crossmarkio/sdk';
import { Button } from '@/components/ui/button';
import { useCrossmark } from '@/hooks/useCrossmark';
import { Client, AccountSet, AccountSetAsfFlags } from 'xrpl'; // xrpl.js 라이브러리 필요
import { toast } from 'sonner'; // 토스트 알림
import { Loader2 } from 'lucide-react';

interface DelegatePermissionProps {
  agentAddress: string; // AI 에이전트의 XRPL 주소
  userAddress: string; // 현재 연결된 사용자의 XRPL 주소 (XRPL 지갑 주소)
  onDelegationComplete: () => void; // 위임 완료 시 호출될 콜백
}

const DelegatePermission: React.FC<DelegatePermissionProps> = ({ agentAddress, userAddress, onDelegationComplete }) => {
  const { account: connectedXrplAddress, connect, loading: isCrossmarkConnecting } = useCrossmark();
  const [isDelegating, setIsDelegating] = useState(false);
  const [isClientConnected, setIsClientConnected] = useState(false); // xrpl.Client 연결 상태

  useEffect(() => {
    const connectXrplClient = async () => {
      const client = new Client("wss://s.devnet.rippletest.net:51233"); // XRPL Devnet WebSocket
      try {
        await client.connect();
        setIsClientConnected(true);
      } catch (error) {
        console.error("Failed to connect to XRPL client:", error);
        toast.error("XRPL 네트워크 연결에 실패했습니다.");
        setIsClientConnected(false);
      }
    };
    connectXrplClient();
  }, []);

  const handleDelegate = async () => {
    if (!connectedXrplAddress || connectedXrplAddress !== userAddress) {
      toast.error("지갑이 연결되지 않았거나 올바른 XRPL 지갑이 아닙니다.");
      return;
    }
    if (!isClientConnected) {
      toast.error("XRPL 네트워크에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsDelegating(true);
    try {
      // --- 실제 XRPL 위임 트랜잭션 로직 (현재 주석 처리됨) ---
      // Crossmark SDK 또는 Devnet Amendment 문제로 인해 임시로 비활성화
      // 추후 SDK 업데이트 또는 Devnet Amendment 활성화 시 재활성화 필요

      // const client = new Client("wss://s.devnet.rippletest.net:51233");
      // await client.connect();

      // // 사용자 계정 정보 가져오기 (Sequence, Fee, LastLedgerSequence 수동 설정을 위해)
      // const accountInfo = await client.request({
      //   command: "account_info",
      //   account: userAddress,
      //   ledger_index: "current",
      // });
      // const currentSequence = accountInfo.result.account_data.Sequence;
      // const lastLedgerSequence = accountInfo.result.ledger_current_index + 10;

      // // XRPL 트랜잭션 구성 (DelegateSet 트랜잭션 - 하드코딩)
      // const preparedTx: any = {
      //   TransactionType: "DelegateSet",
      //   Account: userAddress,
      //   Authorize: agentAddress,
      //   Permissions: [
      //     {Permission: {PermissionValue: 2}},   // Payment
      //     {Permission: {PermissionValue: 35}},  // AMMDeposit
      //     {Permission: {PermissionValue: 20}}   // TrustSet
      //   ],
      //   Sequence: currentSequence,
      //   Fee: "12",
      //   LastLedgerSequence: lastLedgerSequence,
      // };

      // // Crossmark SDK를 사용하여 트랜잭션 서명 요청 및 페이로드 ID 얻기
      // const payloadResponse = await sdk.methods.sign(preparedTx);
      // console.log("Payload Response from SDK:", payloadResponse);

      // const payloadUuid = payloadResponse.payload_uuidv4 || payloadResponse;

      // if (!payloadUuid) {
      //   throw new Error("트랜잭션 서명 요청에 실패했습니다: 페이로드 ID를 얻지 못했습니다.");
      // }

      // // 서명된 트랜잭션 블롭을 폴링하여 가져오기
      // let signedTxResult = null;
      // let attempts = 0;
      // const maxAttempts = 60;

      // while (!signedTxResult && attempts < maxAttempts) {
      //   await new Promise(resolve => setTimeout(resolve, 1000));
      //   const statusResponse = await sdk.methods.getPayload(payloadUuid);
      //   console.log(`Polling attempt ${attempts + 1}:`, statusResponse);

      //   if (statusResponse && statusResponse.signed) {
      //     signedTxResult = statusResponse;
      //   }
      //   attempts++;
      // }

      // if (!signedTxResult || !signedTxResult.signedTransaction) {
      //   throw new Error("트랜잭션 서명 완료를 기다리는 데 실패했습니다.");
      // }

      // const signedTxBlob = signedTxResult.signedTransaction;
      // console.log("Signed Transaction Blob:", signedTxBlob);

      // // 서명된 트랜잭션 블롭을 백엔드로 전송
      // const response = await fetch('/api/user/submit_signed_tx', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ signed_tx_blob: signedTxBlob }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.detail || "트랜잭션 제출 실패");
      // }

      // const result = await response.json();
      // toast.success("위임 트랜잭션이 성공적으로 제출되었습니다!");
      // console.log("Transaction submission result:", result);

      // --- 실제 트랜잭션 로직 끝 ---

      // --- 위임 성공 시뮬레이션 ---
      toast.success("위임이 성공적으로 처리되었습니다! (온체인 트랜잭션은 현재 비활성화)");
      // --- 시뮬레이션 끝 ---

      // 위임 완료 콜백 호출 (UI 업데이트)
      onDelegationComplete();

    } catch (error: any) {
      toast.error(`위임 실패: ${error.message || error.toString()}`);
      console.error("Delegation error:", error);
    } finally {
      setIsDelegating(false);
    }
  };

  const isButtonDisabled = isDelegating || isCrossmarkConnecting || !connectedXrplAddress || !isClientConnected;

  return (
    <div className="flex flex-col items-center justify-center p-6 border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">AI 에이전트 권한 위임</h2>
      <p className="text-center text-muted-foreground mb-6">
        AI 에이전트가 사용자 대신 온체인 작업을 수행하려면 지갑 위임이 필요합니다.
        이는 에이전트가 사용자 지갑에 직접 접근하지 않고, 특정 작업에 대한 권한만 부여하는 안전한 방식입니다.
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        위임할 에이전트 주소: <span className="font-mono text-primary">{agentAddress}</span>
      </p>
      <Button onClick={handleDelegate} disabled={isButtonDisabled}>
        {isDelegating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            위임 진행 중...
          </>
        ) : (
          "AI 에이전트에 권한 위임하기"
        )}
      </Button>
      {!connectedXrplAddress && (
        <p className="text-sm text-red-500 mt-2">XRPL 지갑을 연결해야 위임을 진행할 수 있습니다.</p>
      )}
    </div>
  );
};

export default DelegatePermission;
