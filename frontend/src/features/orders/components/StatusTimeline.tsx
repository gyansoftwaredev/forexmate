import React from 'react';
import { CheckCircle2, Circle, Clock, FileCheck, Shield, Sparkles, Inbox, Award, Send, Landmark, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Order {
  status: string;
  orderNumber?: string;
  productType?: string;
  complianceStatus?: string;
  currentStage?: string;
  deliveryMethod?: string;
  fulfillmentStatus?: string;
  requiresKyc?: boolean;
  requiresInventory?: boolean;
  requiresPickupHandover?: boolean;
  requiresDelivery?: boolean;
  history?: any[];
}

export function StatusTimeline({ order }: { order: Order }) {
  const currentStatus = order.status;
  const compliance = order.complianceStatus || 'PENDING';
  const stage = order.currentStage || 'KYC_STAGE';

  // 1. Determine KYC Status
  const kycCompleted = compliance === 'APPROVED' || compliance === 'VERIFIED' || (stage !== 'KYC_STAGE' && currentStatus !== 'PENDING_KYC');
  const kycCurrent = (stage === 'KYC_STAGE' || currentStatus === 'PENDING_KYC') && !kycCompleted;

  // 2. Determine Compliance Review
  const complianceCompleted = compliance === 'APPROVED' || compliance === 'VERIFIED';
  const complianceCurrent = kycCompleted && !complianceCompleted;

  // 3. Determine Prep Status (only active if compliance is cleared)
  const prepCompleted = complianceCompleted && stage !== 'PREP_STAGE' && stage !== 'KYC_STAGE';
  const prepCurrent = complianceCompleted && stage === 'PREP_STAGE';

  // 4. Determine Handover Status
  const handoverCompleted = currentStatus === 'COMPLETED' || currentStatus === 'DELIVERED';
  const handoverCurrent = prepCompleted && !handoverCompleted && stage === 'FULFILLMENT_STAGE';

  // 5. Overall Completed
  const isCompleted = currentStatus === 'COMPLETED' || currentStatus === 'DELIVERED';

  const isWire = order.productType === 'REMITTANCE' || order.orderNumber?.includes('WIRE') || order.deliveryMethod === 'WIRE_TRANSFER';
  const isSell = order.status === 'CASH_SELL' || order.productType === 'CASH_SELL';

  const getFulfillmentDescription = () => {
    const isPickup = order.deliveryMethod === 'PICKUP' || order.deliveryMethod === 'STORE_PICKUP';
    
    if (stage === 'INVENTORY_STAGE') {
      return isPickup ? 'Reserving currency notes at branch' : 'Packaging secured home delivery';
    }
    
    if (stage === 'FULFILLMENT_STAGE') {
      if (isPickup) {
        return (order.fulfillmentStatus === 'ASSIGNED_TO_CASHIER' || (order as any).complianceLocked || (order as any).currentStage === 'BRANCH_EXECUTION_STAGE')
          ? 'Cash ready for collection at branch vault' 
          : 'Preparing physical currency allocation';
      } else {
        return order.fulfillmentStatus === 'ASSIGNED_TO_DELIVERY' 
          ? 'Out for doorstep delivery by armored courier' 
          : 'Packaging sealed forex kit';
      }
    }
    
    if (currentStatus === 'COMPLETED' || currentStatus === 'DELIVERED') {
      return 'Fulfillment completed';
    }
    
    return isPickup ? 'Preparing Cash Handover' : 'Preparing Secured Delivery';
  };

  const steps = isWire ? [
    {
      label: 'Order Placed & Identity Recorded',
      description: 'Order created, PAN & statutory declarations captured',
      completed: kycCompleted,
      current: kycCurrent,
      icon: Inbox
    },
    {
      label: 'RBI LRS & Sanctions Screening',
      description: 'Verification against Liberalised Remittance limits ($250k USD)',
      completed: complianceCompleted,
      current: complianceCurrent,
      icon: Shield
    },
    {
      label: 'Fund Settlement & Routing',
      description: 'INR settlement confirmation and SWIFT network routing',
      completed: prepCompleted,
      current: prepCurrent,
      icon: Landmark
    },
    {
      label: 'SWIFT MT103 Wire Dispatch',
      description: 'International wire broadcast to beneficiary bank',
      completed: handoverCompleted,
      current: handoverCurrent,
      icon: Send
    },
    {
      label: 'Settled & Completed',
      description: 'Funds credited to foreign account and final receipt generated',
      completed: isCompleted,
      current: isCompleted,
      icon: Award
    }
  ] : isSell ? [
    {
      label: 'Submitted & Identity Check',
      description: 'Order placed, awaiting customer identity verification',
      completed: kycCompleted,
      current: kycCurrent,
      icon: Inbox
    },
    {
      label: 'Compliance Review',
      description: 'Reviewing statutory documents and forex ownership regulations',
      completed: complianceCompleted,
      current: complianceCurrent,
      icon: Shield
    },
    {
      label: 'Currency Handover & Instant INR Payout',
      description: getFulfillmentDescription(),
      completed: handoverCompleted,
      current: handoverCurrent,
      icon: FileCheck
    },
    {
      label: 'Settled & Completed',
      description: 'Transaction settled and funds wired to Indian bank account',
      completed: isCompleted,
      current: isCompleted,
      icon: Award
    }
  ] : [
    {
      label: 'Order Placed & Identity Check',
      description: 'Order placed, awaiting customer identity verification',
      completed: kycCompleted,
      current: kycCurrent,
      icon: Inbox
    },
    {
      label: 'Statutory Compliance Review',
      description: 'Reviewing against LRS limits and security regulations',
      completed: complianceCompleted,
      current: complianceCurrent,
      icon: Shield
    },
    {
      label: 'Branch Prep & Vault Allocation',
      description: 'Reserving physical currency notes / forex cards from branch inventory',
      completed: prepCompleted,
      current: prepCurrent,
      icon: Sparkles
    },
    {
      label: 'Fulfillment Handover',
      description: getFulfillmentDescription(),
      completed: handoverCompleted,
      current: handoverCurrent,
      icon: FileCheck
    },
    {
      label: 'Completed',
      description: 'Transaction fully settled and closed',
      completed: isCompleted,
      current: isCompleted,
      icon: Award
    }
  ];

  return (
    <div className="py-2">
      <div className="relative">
        {/* Continuous Connecting Track */}
        <div className="absolute left-4.5 top-3.5 bottom-6 w-0.5 bg-slate-200" />
        
        <div className="space-y-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative flex items-start gap-4 group">
                {/* Node Icon Container */}
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center relative z-10 shrink-0 transition-all duration-300 shadow-2xs",
                  step.completed 
                    ? "bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white ring-4 ring-emerald-100" 
                    : step.current 
                      ? "bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black ring-4 ring-amber-200/80 animate-pulse" 
                      : "bg-white border-2 border-slate-200 text-slate-400 group-hover:border-slate-300"
                )}>
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-white stroke-[2.5]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Step Metadata */}
                <div className="pt-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "text-xs font-extrabold tracking-tight transition-colors",
                      step.completed 
                        ? "text-emerald-900" 
                        : step.current 
                          ? "text-amber-900 font-black flex items-center gap-1.5" 
                          : "text-slate-600"
                    )}>
                      <span>{step.label}</span>
                      {step.current && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-200 text-amber-950 uppercase tracking-widest border border-amber-300">
                          Active
                        </span>
                      )}
                    </p>
                  </div>
                  <p className={cn(
                    "text-[11px] mt-0.5 font-medium leading-relaxed",
                    step.completed ? "text-emerald-700/80" : step.current ? "text-amber-800/90" : "text-slate-400"
                  )}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


