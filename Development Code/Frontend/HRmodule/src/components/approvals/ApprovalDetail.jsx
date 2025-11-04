import React, { useState } from 'react';
import Badge from '../common/Badge';
import Milestone from '../common/Milestone';

const ApprovalDetail = ({ request, onApprove, onReject, onBack, loading = false }) => {
  const [approvalRemark, setApprovalRemark] = useState("");

  if (!request) {
    return (
      <div className="content">
        <div className="error">Request not found</div>
        <button onClick={onBack} className="btn btnSecondary">Back to List</button>
      </div>
    );
  }

  const handleApprove = () => {
    if (!approvalRemark.trim()) {
      alert("Please add a remark before approving.");
      return;
    }
    onApprove(request.id, approvalRemark);
    setApprovalRemark("");
  };

  const handleReject = () => {
    if (!approvalRemark.trim()) {
      alert("Please add a remark before rejecting.");
      return;
    }
    onReject(request.id, approvalRemark);
    setApprovalRemark("");
  };

  return (
    <div className="content">
      <div className="detailHeader">
        <h2>HR Request Details</h2>
        <button onClick={onBack} className="btn btnSecondary">
          <span className="btnIconSvg">←</span> Back to Approval Requests
        </button>
      </div>

      <div className="card">
        <div className="cardHeaderFlex">
          <div>
            <h3>{request.title}</h3>
            <p>Request ID: {request.id}</p>
            <p>Employee: {request.employee.name} ({request.employee.department})</p>
          </div>
          <div>
            <Badge variant={request.status}>
              {request.status === "pending" ? "Pending HR Approval" :
                request.status === "approved" ? "Approved" :
                  request.status === "rejected" ? "Rejected" : "Status"}
            </Badge>
          </div>
        </div>

        <div className="cardBodyGrid">
          <div>
            <h4>Request Details</h4>
            <div className="detailList">
              <div className="detailItem"><span>Type:</span><span><span className={`request-type-badge ${request.type}`}>{request.type}</span></span></div>
              <div className="detailItem"><span>Employee:</span><span>{request.employee.name} ({request.employee.department})</span></div>
              <div className="detailItem"><span>Dates:</span><span>{request.dates}</span></div>
              <div className="detailItem"><span>Details:</span><span>{request.details}</span></div>
            </div>
          </div>
          <div>
            <h4>Approval Process</h4>
            <div className="detailList">
              <div className="detailItem"><span>Current Stage:</span><span>{request.stage}</span></div>
              <div className="detailItem"><span>Status:</span><Badge variant={request.status}>{request.status}</Badge></div>
              {request.approverRemark && (
                <div className="detailItem"><span>Approver Remark:</span><span>{request.approverRemark}</span></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {request.status === "pending" && (
        <div className="card">
          <div className="cardHeader">
            <h3>HR Approval</h3>
            <p>Approve or reject this request</p>
          </div>
          <div className="cardBody">
            <div className="formGroupFull">
              <label>Approval Remark</label>
              <textarea
                value={approvalRemark}
                onChange={(e) => setApprovalRemark(e.target.value)}
                className="formControl"
                rows="3"
                placeholder="Enter your approval remark or reason for rejection"
                disabled={loading}
              />
            </div>
            <div className="formActions">
              <button
                onClick={handleReject}
                className="btn btnReject"
                disabled={loading}
              >
                <i className="fas fa-ban"></i> Reject
              </button>
              <button
                onClick={handleApprove}
                className="btn btnAccent"
                disabled={loading}
              >
                <i className="fas fa-check"></i> Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {request.approverRemark && (
        <div className="card">
          <div className="cardHeader">
            <h3>Approval Details</h3>
          </div>
          <div className="cardBody">
            <div className="detailItem">
              <span>HR Remark:</span>
              <span>{request.approverRemark}</span>
            </div>
          </div>
        </div>
      )}

      {request.status === "approved" && (
        <div className="card processCard">
          <div className="processComplete">
            <i className="fas fa-check-circle processCompleteIcon"></i>
            <h4>Process Completed</h4>
            <p>This request has been approved and processed.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export { ApprovalDetail };
export default ApprovalDetail;