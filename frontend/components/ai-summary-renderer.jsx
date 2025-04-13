// components/ai-summary-renderer.jsx

import React, { useState, useEffect } from 'react';
import { EnhancedTypingEffect } from './ui/typing-effect';

// مكون لعرض نص الذكاء الاصطناعي بتنسيق مناسب وتأثير الكتابة
export function AISummaryRenderer({ markdown, typingEffect = true }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [parsedContent, setParsedContent] = useState([]);
  
  // تقسيم النص إلى فقرات وقوائم وعناوين
  useEffect(() => {
    if (!markdown) return;
    
    // معالجة المحتوى لتحويله من Markdown إلى عناصر منظمة
    const lines = markdown.split('\n').filter(line => line.trim() !== '');
    const content = [];
    let listItems = [];
    let listType = null;

    lines.forEach((line, i) => {
      // التعامل مع العناوين
      if (line.startsWith('# ')) {
        if (listItems.length > 0) {
          content.push({ type: listType, items: [...listItems] });
          listItems = [];
          listType = null;
        }
        content.push({ type: 'h1', content: line.substring(2) });
      } 
      else if (line.startsWith('## ')) {
        if (listItems.length > 0) {
          content.push({ type: listType, items: [...listItems] });
          listItems = [];
          listType = null;
        }
        content.push({ type: 'h2', content: line.substring(3) });
      } 
      else if (line.startsWith('### ')) {
        if (listItems.length > 0) {
          content.push({ type: listType, items: [...listItems] });
          listItems = [];
          listType = null;
        }
        content.push({ type: 'h3', content: line.substring(4) });
      } 
      // التعامل مع القوائم المرقمة
      else if (/^\d+\.\s/.test(line)) {
        if (listType && listType !== 'ol') {
          content.push({ type: listType, items: [...listItems] });
          listItems = [];
        }
        listType = 'ol';
        listItems.push(line.replace(/^\d+\.\s/, ''));
      } 
      // التعامل مع القوائم النقطية
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        if (listType && listType !== 'ul') {
          content.push({ type: listType, items: [...listItems] });
          listItems = [];
        }
        listType = 'ul';
        listItems.push(line.substring(2));
      } 
      // التعامل مع الفقرات العادية
      else {
        if (listItems.length > 0) {
          content.push({ type: listType, items: [...listItems] });
          listItems = [];
          listType = null;
        }
        content.push({ type: 'p', content: line });
      }
      
      // إضافة القائمة المتبقية في النهاية
      if (i === lines.length - 1 && listItems.length > 0) {
        content.push({ type: listType, items: [...listItems] });
      }
    });
    
    setParsedContent(content);
  }, [markdown]);

  // تأثير الكتابة المتدرجة
  useEffect(() => {
    if (!markdown || !typingEffect) {
      setDisplayedText(markdown || '');
      return;
    }

    setIsTyping(true);
    let currentText = '';
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < markdown.length) {
        currentText += markdown[currentIndex];
        setDisplayedText(currentText);
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 10); // سرعة الكتابة
    
    return () => clearInterval(interval);
  }, [markdown, typingEffect]);

  // تحويل النص العادي مع تنسيقات Markdown البسيطة
  const formatText = (text) => {
    if (!text) return '';
    
    // معالجة الروابط [نص](رابط)
    let formattedText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 hover:underline">$1</a>');
    
    // معالجة النص العريض **نص**
    formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
    
    // معالجة النص المائل *نص*
    formattedText = formattedText.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
    
    // معالجة الكود `نص`
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    
    return formattedText;
  };

  // تقديم المحتوى المنسق
  const renderContent = () => {
    if (typingEffect && isTyping) {
      return <div dangerouslySetInnerHTML={{ __html: formatText(displayedText) }} />;
    }
    
    return (
      <>
        {parsedContent.map((item, index) => {
          switch (item.type) {
            case 'h1':
              return <h1 key={index} className="text-3xl font-semibold my-4" dangerouslySetInnerHTML={{ __html: formatText(item.content) }} />;
            case 'h2':
              return <h2 key={index} className="text-2xl font-semibold my-3" dangerouslySetInnerHTML={{ __html: formatText(item.content) }} />;
            case 'h3':
              return <h3 key={index} className="text-xl font-semibold my-2" dangerouslySetInnerHTML={{ __html: formatText(item.content) }} />;
            case 'p':
              return <p key={index} className="my-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(item.content) }} />;
            case 'ul':
              return (
                <ul key={index} className="list-disc pl-6 my-2 space-y-1">
                  {item.items.map((li, i) => (
                    <li key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(li) }} />
                  ))}
                </ul>
              );
            case 'ol':
              return (
                <ol key={index} className="list-decimal pl-6 my-2 space-y-1">
                  {item.items.map((li, i) => (
                    <li key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(li) }} />
                  ))}
                </ol>
              );
            default:
              return null;
          }
        })}
      </>
    );
  };

  // مكون متقدم يستخدم المكون EnhancedTypingEffect للتنسيق
  const renderWithEnhancedTyping = () => {
    if (!typingEffect) {
      return renderContent();
    }
    
    return (
      <div className="ai-summary-renderer">
        {parsedContent.map((item, index) => {
          switch (item.type) {
            case 'h1':
              return (
                <h1 key={index} className="text-3xl font-semibold my-4">
                  <EnhancedTypingEffect 
                    text={item.content} 
                    speed={20} 
                    delay={index * 100}
                  />
                </h1>
              );
            case 'h2':
              return (
                <h2 key={index} className="text-2xl font-semibold my-3">
                  <EnhancedTypingEffect 
                    text={item.content} 
                    speed={25} 
                    delay={index * 100}
                  />
                </h2>
              );
            case 'h3':
              return (
                <h3 key={index} className="text-xl font-semibold my-2">
                  <EnhancedTypingEffect 
                    text={item.content} 
                    speed={25} 
                    delay={index * 100}
                  />
                </h3>
              );
            case 'p':
              return (
                <p key={index} className="my-2 leading-relaxed">
                  <EnhancedTypingEffect 
                    text={item.content} 
                    speed={10} 
                    delay={index * 100}
                  />
                </p>
              );
            case 'ul':
              return (
                <ul key={index} className="list-disc pl-6 my-2 space-y-1">
                  {item.items.map((li, i) => (
                    <li key={i} className="leading-relaxed">
                      <EnhancedTypingEffect 
                        text={li} 
                        speed={10} 
                        delay={(index * 300) + (i * 200)}
                      />
                    </li>
                  ))}
                </ul>
              );
            case 'ol':
              return (
                <ol key={index} className="list-decimal pl-6 my-2 space-y-1">
                  {item.items.map((li, i) => (
                    <li key={i} className="leading-relaxed">
                      <EnhancedTypingEffect 
                        text={li} 
                        speed={10} 
                        delay={(index * 300) + (i * 200)}
                      />
                    </li>
                  ))}
                </ol>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  return (
    <div className="ai-summary-renderer">
      {/* يمكن اختيار طريقة العرض بناءً على ما إذا كان تأثير الكتابة المحسن متاحًا */}
      {renderContent()}
      {typingEffect && isTyping && (
        <span className="inline-block h-5 w-2 bg-black ml-1 animate-pulse"></span>
      )}
    </div>
  );
}

// نسخة مبسطة من المكون، تركز على تنسيق وعرض Markdown فقط، بدون تأثير الكتابة
export function MarkdownRenderer({ markdown, className = "" }) {
  const [parsedContent, setParsedContent] = useState([]);
  
  useEffect(() => {
    if (!markdown) return;
    
    // نفس منطق التحليل من المكون السابق
    const lines = markdown.split('\n').filter(line => line.trim() !== '');
    const content = [];
    let listItems = [];
    let listType = null;

    lines.forEach((line, i) => {
      if (line.startsWith('# ')) {
        if (listItems.length > 0) {
          content.push({ type: listType, items: [...listItems] });
          listItems = [];
          listType = null;
        }
        content.push({ type: 'h1', content: line.substring(2) });
      } 
      else if (line.startsWith('## ')) {
        if (listItems.length > 0) {
          content.push({ type: listType, items: [...listItems] });
          listItems = [];
          listType = null;
        }
        content.push({ type: 'h2', content: line.substring(3) });
      } 
      else if (line.startsWith('### ')) {
        if (listItems.length > 0) {
          content.push({ type: listType, items: [...listItems] });
          listItems = [];
          listType = null;
        }
        content.push({ type: 'h3', content: line.substring(4) });
      } 
      else if (/^\d+\.\s/.test(line)) {
        if (listType && listType !== 'ol') {
          content.push({ type: listType, items: [...listItems] });
          listItems = [];
        }
        listType = 'ol';
        listItems.push(line.replace(/^\d+\.\s/, ''));
      } 
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        if (listType && listType !== 'ul') {
          content.push({ type: listType, items: [...listItems] });
          listItems = [];
        }
        listType = 'ul';
        listItems.push(line.substring(2));
      } 
      else {
        if (listItems.length > 0) {
          content.push({ type: listType, items: [...listItems] });
          listItems = [];
          listType = null;
        }
        content.push({ type: 'p', content: line });
      }
      
      if (i === lines.length - 1 && listItems.length > 0) {
        content.push({ type: listType, items: [...listItems] });
      }
    });
    
    setParsedContent(content);
  }, [markdown]);

  // نفس دالة formatText من المكون السابق
  const formatText = (text) => {
    if (!text) return '';
    
    let formattedText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 hover:underline">$1</a>');
    
    formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
    
    formattedText = formattedText.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
    
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    
    return formattedText;
  };

  return (
    <div className={`markdown-renderer ${className}`}>
      {parsedContent.map((item, index) => {
        switch (item.type) {
          case 'h1':
            return <h1 key={index} className="text-3xl font-semibold my-4" dangerouslySetInnerHTML={{ __html: formatText(item.content) }} />;
          case 'h2':
            return <h2 key={index} className="text-2xl font-semibold my-3" dangerouslySetInnerHTML={{ __html: formatText(item.content) }} />;
          case 'h3':
            return <h3 key={index} className="text-xl font-semibold my-2" dangerouslySetInnerHTML={{ __html: formatText(item.content) }} />;
          case 'p':
            return <p key={index} className="my-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(item.content) }} />;
          case 'ul':
            return (
              <ul key={index} className="list-disc pl-6 my-2 space-y-1">
                {item.items.map((li, i) => (
                  <li key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(li) }} />
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={index} className="list-decimal pl-6 my-2 space-y-1">
                {item.items.map((li, i) => (
                  <li key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(li) }} />
                ))}
              </ol>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export default AISummaryRenderer;