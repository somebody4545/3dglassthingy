"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { DetailViewProps } from "./types";
import { getSectionInfo } from './sectionData';

export default function DetailView({ selectedSection, onClose }: DetailViewProps) {
  const info = selectedSection !== null ? getSectionInfo(selectedSection) : undefined;
  return (
    <AnimatePresence>
      {selectedSection !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.25, 0.46, 0.45, 0.94] // Custom easing
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 40, 0.95))',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            pointerEvents: 'auto'
          }}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{
              maxWidth: '800px',
              width: '90%',
              textAlign: 'center',
              padding: '40px'
            }}
          >
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{
                fontSize: '4rem',
                fontWeight: 'bold',
                marginBottom: '30px',
                color: '#99ff99',
                textShadow: '0 0 20px rgba(153, 255, 153, 0.5)'
              }}
            >
              {info?.title ?? `Section ${selectedSection}`}
            </motion.h1>
            
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              style={{
                fontSize: '1.4rem',
                lineHeight: '1.8',
                marginBottom: '50px',
                maxWidth: '600px',
                margin: '0 auto 50px'
              }}
            >
              {info?.description && (
                <p style={{ marginBottom: '25px' }}>
                  {info.description}
                </p>
              )}
              {info?.image && (
                <motion.img 
                  src={info.image} 
                  alt={info.title} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  style={{
                    width: '100%',
                    maxWidth: '500px',
                    borderRadius: '16px',
                    margin: '0 auto 30px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.4)' 
                  }}
                />
              )}
              {info?.video && (
                <motion.video 
                  key={info.video}
                  src={info.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{
                    width: '100%',
                    maxWidth: '600px',
                    borderRadius: '20px',
                    margin: '0 auto 40px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                    display: 'block'
                  }}
                />
              )}
              <ul style={{ paddingLeft: '20px', marginBottom: '25px', textAlign: 'left' }}>
                <li style={{ marginBottom: '10px' }}>Feature 1 of {info?.title ?? `Section ${selectedSection}`}</li>
                <li style={{ marginBottom: '10px' }}>Feature 2 of {info?.title ?? `Section ${selectedSection}`}</li>
                <li style={{ marginBottom: '10px' }}>Feature 3 of {info?.title ?? `Section ${selectedSection}`}</li>
              </ul>
            </motion.div>
            
            <motion.button
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 8px 25px rgba(153, 255, 153, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={{
                background: 'linear-gradient(135deg, #99ff99, #66cc66)',
                color: 'black',
                border: 'none',
                padding: '15px 40px',
                borderRadius: '50px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ← Back to Overview
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
