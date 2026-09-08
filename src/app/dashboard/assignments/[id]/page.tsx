'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft, Edit, Package, User, Calendar, MapPin, CheckCircle, AlertCircle, XCircle, RefreshCw, IdCard, Mail } from 'lucide-react';
import { assetAssignmentsApi, AssetAssignment, AssignmentStatus } from '../../../../api/asset-assignments';
import { usePermissions } from '../../../../hooks/use-permissions';
import { PermissionGuard } from '../../../../components/auth/permission-guard';
import { ReturnModal, LostModal, RevokeModal } from '../../../../components/assignments/assignment-modals';

export default function AssignmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { can } = usePermissions();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<AssetAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Return form state
  const [returnCondition, setReturnCondition] = useState('');
  const [returnRemarks, setReturnRemarks] = useState('');
  const [lostRemarks, setLostRemarks] = useState('');
  const [revokeRemarks, setRevokeRemarks] = useState('');

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const data = await assetAssignmentsApi.getById(assignmentId);
      setAssignment(data);
    } catch (err: any) {
      console.error('Failed to fetch assignment:', err);
      setError(err?.response?.data?.message || 'Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    try {
      setActionLoading(true);
      await assetAssignmentsApi.return(assignmentId, {
        conditionAtReturn: returnCondition,
        returnRemarks: returnRemarks,
      });
      setShowReturnModal(false);
      fetchAssignment();
    } catch (err: any) {
      console.error('Failed to return asset:', err);
      setError(err?.response?.data?.message || 'Failed to return asset');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportLost = async () => {
    try {
      setActionLoading(true);
      await assetAssignmentsApi.reportLost(assignmentId, {
        remarks: lostRemarks,
      });
      setShowLostModal(false);
      fetchAssignment();
    } catch (err: any) {
      console.error('Failed to report lost:', err);
      setError(err?.response?.data?.message || 'Failed to report lost');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    try {
      setActionLoading(true);
      await assetAssignmentsApi.revoke(assignmentId, {
        revokeRemarks: revokeRemarks,
      });
      setShowRevokeModal(false);
      fetchAssignment();
    } catch (err: any) {
      console.error('Failed to revoke assignment:', err);
      setError(err?.response?.data?.message || 'Failed to revoke assignment');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status?: AssignmentStatus) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      returned: 'bg-blue-100 text-blue-800',
      lost: 'bg-red-100 text-red-800',
      revoked: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status || 'active'] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status?: AssignmentStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="size-5 text-green-600" />;
      case 'returned':
        return <RefreshCw className="size-5 text-blue-600" />;
      case 'lost':
        return <XCircle className="size-5 text-red-600" />;
      case 'revoked':
        return <AlertCircle className="size-5 text-yellow-600" />;
      default:
        return <CheckCircle className="size-5 text-green-600" />;
    }
  };

  const getAssetName = () => {
    if (typeof assignment?.asset === 'object') {
      return `${assignment.asset.assetTag} - ${assignment.asset.name}`;
    }
    return assignment?.asset || 'Unknown';
  };

  const getEmployeeName = () => {
    if (typeof assignment?.employee === 'object') {
      return assignment.employee.fullName;
    }
    return assignment?.employee || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading assignment details...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">{error || 'Assignment not found'}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/assignments')}>
            Back to Assignments
          </Button>
        </div>
      </div>
    );
  }

  const isHardware = assignment.assetKind === 'hardware';
  const isActive = assignment.status === 'active';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignment Details</h1>
          <p className="text-muted-foreground mt-2">
            View and manage asset assignment
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.push('/dashboard/assignments')}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Assignments
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Status Banner */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border">
        <div className={`p-3 rounded-full ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
          {getStatusIcon(assignment.status)}
        </div>
        <div className="flex-1">
          <p className="font-medium capitalize text-lg">{assignment.status || 'Active'}</p>
          <p className="text-sm text-muted-foreground">
            {isActive ? 'Asset is currently assigned' : 'Assignment has been closed'}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(assignment.status)}`}>
          {assignment.status || 'Active'}
        </span>
      </div>

      {/* Asset and Employee Cards Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Information Card */}
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="size-5" />
              Asset Information
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Package className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Asset</p>
                <p className="font-medium">{getAssetName()}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Kind</p>
                <p className="font-medium capitalize">{assignment.assetKind.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Assigned Date</p>
                <p className="font-medium">{new Date(assignment.assignedDate).toLocaleDateString()}</p>
              </div>
            </div>
            {isHardware && assignment.expectedReturnDate && (
              <div className="flex items-start gap-3">
                <Calendar className="size-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Expected Return</p>
                  <p className="font-medium">{new Date(assignment.expectedReturnDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            {isHardware && assignment.returnedDate && (
              <div className="flex items-start gap-3">
                <Calendar className="size-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Returned Date</p>
                  <p className="font-medium">{new Date(assignment.returnedDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            {isHardware && (assignment.conditionAtAssignment || assignment.conditionAtReturn) && (
              <>
                {assignment.conditionAtAssignment && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="size-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Condition at Assignment</p>
                      <p className="font-medium capitalize">{assignment.conditionAtAssignment}</p>
                    </div>
                  </div>
                )}
                {assignment.conditionAtReturn && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="size-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Condition at Return</p>
                      <p className="font-medium capitalize">{assignment.conditionAtReturn}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Employee Information Card */}
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="size-5" />
              Employee Information
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <User className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Assigned To</p>
                <p className="font-medium">{getEmployeeName()}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{assignment.employee?.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IdCard className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Employee ID</p>
                <p className="font-medium">{assignment.employee?.employeeCode}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remarks Card */}
      {(assignment.remarks || assignment.returnRemarks) && (
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold">Remarks</h2>
          </div>
          <div className="p-6 space-y-3">
            {assignment.remarks && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Assignment</p>
                <p className="text-sm">{assignment.remarks}</p>
              </div>
            )}
            {assignment.returnRemarks && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Return</p>
                <p className="text-sm">{assignment.returnRemarks}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isActive && (
        <div className="rounded-lg border border-border bg-card shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <PermissionGuard permission="assignments:update">
              {isHardware && (
                <Button onClick={() => setShowReturnModal(true)}>
                  <CheckCircle className="mr-2 size-4" />
                  Return Asset
                </Button>
              )}
              <Button variant="destructive" onClick={() => setShowLostModal(true)}>
                <XCircle className="mr-2 size-4" />
                Report Lost
              </Button>
              {!isHardware && (
                <Button variant="outline" onClick={() => setShowRevokeModal(true)}>
                  <RefreshCw className="mr-2 size-4" />
                  Revoke License
                </Button>
              )}
            </PermissionGuard>
          </div>
        </div>
      )}

      {/* Return Modal */}
      <ReturnModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onSubmit={handleReturn}
        loading={actionLoading}
        condition={returnCondition}
        onConditionChange={setReturnCondition}
        remarks={returnRemarks}
        onRemarksChange={setReturnRemarks}
      />

      {/* Lost Modal */}
      <LostModal
        isOpen={showLostModal}
        onClose={() => setShowLostModal(false)}
        onSubmit={handleReportLost}
        loading={actionLoading}
        remarks={lostRemarks}
        onRemarksChange={setLostRemarks}
      />

      {/* Revoke Modal */}
      <RevokeModal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        onSubmit={handleRevoke}
        loading={actionLoading}
        remarks={revokeRemarks}
        onRemarksChange={setRevokeRemarks}
      />
    </div>
  );
}
