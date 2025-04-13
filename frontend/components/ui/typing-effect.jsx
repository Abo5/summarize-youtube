// components/ui/typing-effect.jsx

import React, { useState, useEffect, useRef } from 'react';

export const EnhancedTypingEffect = ({ 
  text, 
  speed = 30,
  delay = 0,
  cursor = true,
  onComplete = () => {},
  className = "",
  cursorClassName = "inline-block h-5 w-2 ml-1 bg-black animate-pulse"
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!text) return;
    
    // Reset state when text changes
    setDisplayedText('');
    setIsComplete(false);
    
    let currentText = '';
    let currentIndex = 0;
    
    // Add initial delay
    const startTyping = () => {
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          // Implement variable speed for punctuation
          const char = text[currentIndex];
          currentText += char;
          setDisplayedText(currentText);
          currentIndex++;
          
          // Slow down slightly for punctuation
          if (['.', '!', '?', ',', ';', ':'].includes(char)) {
            clearInterval(interval);
            timeoutRef.current = setTimeout(() => startTyping(), speed * 6);
            return;
          }
          
          // Add slight pause for new lines and paragraphs
          if (char === '\n') {
            clearInterval(interval);
            timeoutRef.current = setTimeout(() => startTyping(), speed * 10);
            return;
          }
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onComplete();
        }
      }, speed);
      
      return interval;
    };
    
    timeoutRef.current = setTimeout(() => {
      const interval = startTyping();
      return () => {
        clearInterval(interval);
        clearTimeout(timeoutRef.current);
      };
    }, delay);
    
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [text, speed, delay, onComplete]);
  
  // معالجة النص المعروض مع تنسيقات بسيطة
  const formatText = (text) => {
    if (!text) return '';
    
    // استخدام تعبيرات منتظمة لتنسيق النص
    let formattedText = text;
    
    // معالجة النص العريض **نص**
    formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // معالجة النص المائل *نص*
    formattedText = formattedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // معالجة الروابط [نص](رابط)
    formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 hover:underline">$1</a>');
    
    // معالجة الكود `نص`
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>');
    
    return formattedText;
  };
  
  return (
    <div className={className}>
      <span dangerouslySetInnerHTML={{ __html: formatText(displayedText) }} />
      {cursor && !isComplete && (
        <span className={cursorClassName}></span>
      )}
    </div>
  );
};

// مكون إضافي أكثر تقدمًا للكتابة مع وقفات مختلفة ودعم المقاطع
export const AdvancedTypingEffect = ({
  content = [],  // مصفوفة من الكائنات مع نص وسرعة ووقفة
  className = "",
  cursorClassName = "inline-block h-5 w-2 ml-1 bg-black animate-pulse",
  onComplete = () => {}
}) => {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [displayedSegments, setDisplayedSegments] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    if (!content.length || currentSegmentIndex >= content.length) {
      onComplete();
      return;
    }
    
    setIsTyping(true);
    const segment = content[currentSegmentIndex];
    const timer = setTimeout(() => {
      setDisplayedSegments(prev => [...prev, segment]);
      setCurrentSegmentIndex(prev => prev + 1);
      setIsTyping(false);
    }, segment.delay || 0);
    
    return () => clearTimeout(timer);
  }, [content, currentSegmentIndex, onComplete]);
  
  return (
    <div className={className}>
      {displayedSegments.map((segment, i) => (
        <div key={i} className={segment.className || ''}>
          <EnhancedTypingEffect 
            text={segment.text} 
            speed={segment.speed || 30}
            delay={0}  // الوقفة تم التعامل معها بالفعل في هذا المستوى
            cursor={false}
            className={segment.textClassName || ''}
          />
        </div>
      ))}
      {isTyping && (
        <span className={cursorClassName}></span>
      )}
    </div>
  );
};

// استخدم هذا لكتابة نص مع تأخير وانتظار لإظهار النص التالي
export const TypewriterEffect = ({ 
  textItems = [], // مصفوفة من الأنماط لعرضها بالتسلسل { text: string, delay: number }
  cursorClassName = "inline-block h-5 w-2 ml-1 bg-black animate-pulse",
  className = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  
  useEffect(() => {
    if (textItems.length === 0 || currentIndex >= textItems.length) return;
    
    const currentItem = textItems[currentIndex];
    let typingTimeout;
    
    const typeText = () => {
      setIsTyping(true);
      let i = 0;
      const text = currentItem.text;
      
      const typeChar = () => {
        if (i < text.length) {
          setDisplayText(prev => prev + text.charAt(i));
          i++;
          typingTimeout = setTimeout(typeChar, Math.random() * 40 + 30); // سرعة كتابة عشوائية للواقعية
        } else {
          setIsTyping(false);
          
          // عند الانتهاء من الكتابة، انتظر ثم امسح
          typingTimeout = setTimeout(() => {
            if (currentIndex < textItems.length - 1) {
              eraseText();
            } else {
              // انتهت جميع عناصر النص
              setShowCursor(false);
            }
          }, currentItem.stayTime || 2000);
        }
      };
      
      const eraseText = () => {
        setIsTyping(true);
        let text = displayText;
        
        const eraseChar = () => {
          if (text.length > 0) {
            text = text.slice(0, -1);
            setDisplayText(text);
            typingTimeout = setTimeout(eraseChar, Math.random() * 20 + 10); // سرعة مسح أسرع
          } else {
            setIsTyping(false);
            setCurrentIndex(prev => prev + 1);
          }
        };
        
        typingTimeout = setTimeout(eraseChar, currentItem.eraseDelay || 500);
      };
      
      // ابدأ الطباعة بعد التأخير المحدد
      typingTimeout = setTimeout(typeChar, currentItem.delay || 0);
    };
    
    // ابدأ عملية الكتابة
    typeText();
    
    return () => clearTimeout(typingTimeout);
  }, [textItems, currentIndex]);
  
  // عندما يتغير فهرس العنصر الحالي، ابدأ بنص فارغ
  useEffect(() => {
    setDisplayText('');
  }, [currentIndex]);
  
  return (
    <div className={className}>
      <span>{displayText}</span>
      {showCursor && <span className={cursorClassName}></span>}
    </div>
  );
};

export default EnhancedTypingEffect;