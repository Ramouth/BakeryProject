import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// Improved Modal component with better scroll handling
const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  // Close modal on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      // Allow scrolling within modal content
      const preventScroll = (e) => {
        const contentEl = contentRef.current;
        if (!contentEl) return;

        const isAtTop = contentEl.scrollTop === 0;
        const isAtBottom = 
          contentEl.scrollHeight - contentEl.scrollTop === contentEl.clientHeight;

        // Allow natural scrolling within the modal content
        if (
          (e.deltaY < 0 && !isAtTop) || // Scrolling up when not at top
          (e.deltaY > 0 && !isAtBottom) // Scrolling down when not at bottom
        ) {
          return;
        }

        // Prevent page scroll when at modal content bounds
        e.preventDefault();
      };

      const modalContent = contentRef.current;
      if (modalContent) {
        modalContent.addEventListener('wheel', preventScroll, { passive: false });
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        if (modalContent) {
          modalContent.removeEventListener('wheel', preventScroll);
        }
      };
    }
  }, [isOpen, onClose]);

  // Close modal when clicking outside
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal" 
      onClick={handleClickOutside}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 1000,
        overscrollBehavior: 'contain' 
      }}
    >
      <div 
        ref={modalRef}
        className="modal-content"
        style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          maxWidth: '90%',
          maxHeight: '90%',
          width: '500px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        <div 
          className="modal-header"
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '15px', 
            borderBottom: '1px solid #eee' 
          }}
        >
          {title && <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{title}</h2>}
          <span 
            className="close" 
            onClick={onClose}
            style={{ 
              cursor: 'pointer', 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#888' 
            }}
          >
            &times;
          </span>
        </div>
        <div 
          ref={contentRef}
          className="modal-body"
          style={{ 
            padding: '15px', 
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 100px)',
            scrollBehavior: 'smooth'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Modal;