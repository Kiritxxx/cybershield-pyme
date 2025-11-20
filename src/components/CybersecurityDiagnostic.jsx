import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, FileText, TrendingUp, Award } from 'lucide-react';

const CybersecurityDiagnostic = () => {
  const [currentStep, setCurrentStep] = useState('questionnaire');
  const [answers, setAnswers] = useState({});
  const [diagnostic, setDiagnostic] = useState(null);

  const categories = {
    technical: {
      name: 'Seguridad Técnica',
      weight: 0.4,
      icon: Shield,
      questions: [
        { id: 't1', text: '¿Tienen firewall activo en su red?', points: 10 },
        { id: 't2', text: '¿Realizan actualizaciones de software regularmente?', points: 10 },
        { id: 't3', text: '¿Tienen antivirus/antimalware en todos los equipos?', points: 10 },
        { id: 't4', text: '¿Hacen copias de seguridad (backups) periódicas?', points: 15 },
        { id: 't5', text: '¿Tienen un plan de recuperación ante desastres?', points: 10 },
        { id: 't6', text: '¿Usan cifrado para datos sensibles?', points: 10 },
        { id: 't7', text: '¿Monitorean la red en busca de actividades sospechosas?', points: 10 },
        { id: 't8', text: '¿Tienen segmentación de red (separación de áreas críticas)?', points: 10 },
        { id: 't9', text: '¿Utilizan autenticación de dos factores (2FA)?', points: 15 }
      ]
    },
    human: {
      name: 'Factor Humano',
      weight: 0.3,
      icon: Award,
      questions: [
        { id: 'h1', text: '¿Capacitan a empleados en ciberseguridad al menos 1 vez al año?', points: 15 },
        { id: 'h2', text: '¿Los empleados saben identificar correos de phishing?', points: 15 },
        { id: 'h3', text: '¿Tienen políticas claras sobre uso de contraseñas fuertes?', points: 10 },
        { id: 'h4', text: '¿Los empleados reportan incidentes de seguridad?', points: 10 },
        { id: 'h5', text: '¿Existe un responsable o encargado de ciberseguridad?', points: 15 },
        { id: 'h6', text: '¿Restringen el uso de dispositivos USB externos?', points: 10 },
        { id: 'h7', text: '¿Tienen políticas sobre trabajo remoto seguro?', points: 15 }
      ]
    },
    organizational: {
      name: 'Gestión Organizacional',
      weight: 0.3,
      icon: FileText,
      questions: [
        { id: 'o1', text: '¿Tienen una política de seguridad documentada?', points: 15 },
        { id: 'o2', text: '¿Controlan quién tiene acceso a información sensible?', points: 15 },
        { id: 'o3', text: '¿Tienen un procedimiento para dar de baja usuarios que dejan la empresa?', points: 10 },
        { id: 'o4', text: '¿Realizan auditorías de seguridad periódicas?', points: 10 },
        { id: 'o5', text: '¿Tienen un plan de respuesta ante incidentes de seguridad?', points: 15 },
        { id: 'o6', text: '¿Cumplen con regulaciones de protección de datos aplicables?', points: 15 },
        { id: 'o7', text: '¿Evalúan la seguridad de proveedores externos?', points: 10 }
      ]
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateDiagnostic = () => {
    let categoryScores = {};
    let totalWeightedScore = 0;

    Object.entries(categories).forEach(([catKey, category]) => {
      let categoryPoints = 0;
      let maxPoints = 0;

      category.questions.forEach(q => {
        maxPoints += q.points;
        if (answers[q.id] === 'yes') {
          categoryPoints += q.points;
        }
      });

      const percentage = maxPoints > 0 ? (categoryPoints / maxPoints) * 100 : 0;
      categoryScores[catKey] = {
        name: category.name,
        score: percentage,
        points: categoryPoints,
        maxPoints: maxPoints
      };

      totalWeightedScore += percentage * category.weight;
    });

    const vulnerabilities = identifyVulnerabilities();
    const recommendations = generateRecommendations(categoryScores, vulnerabilities);
    const riskLevel = getRiskLevel(totalWeightedScore);

    setDiagnostic({
      overallScore: totalWeightedScore,
      categoryScores,
      riskLevel,
      vulnerabilities,
      recommendations,
      date: new Date().toLocaleDateString()
    });

    setCurrentStep('results');
  };

  const identifyVulnerabilities = () => {
    const vulns = [];
    
    Object.entries(categories).forEach(([catKey, category]) => {
      category.questions.forEach(q => {
        if (answers[q.id] === 'no') {
          vulns.push({
            category: category.name,
            question: q.text,
            severity: q.points >= 15 ? 'high' : q.points >= 10 ? 'medium' : 'low'
          });
        }
      });
    });

    return vulns.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  };

  const generateRecommendations = (scores, vulnerabilities) => {
    const recs = [];

    Object.entries(scores).forEach(([key, data]) => {
      if (data.score < 50) {
        recs.push({
          priority: 'critical',
          category: data.name,
          title: `Mejorar urgentemente ${data.name}`,
          description: `Su puntuación en ${data.name} es crítica (${data.score.toFixed(0)}%). Requiere atención inmediata.`,
          actions: getCategoryActions(key, 'critical')
        });
      } else if (data.score < 70) {
        recs.push({
          priority: 'high',
          category: data.name,
          title: `Reforzar ${data.name}`,
          description: `Su puntuación en ${data.name} es baja (${data.score.toFixed(0)}%). Requiere mejoras significativas.`,
          actions: getCategoryActions(key, 'high')
        });
      }
    });

    vulnerabilities.slice(0, 5).forEach(vuln => {
      recs.push({
        priority: vuln.severity === 'high' ? 'critical' : vuln.severity,
        category: vuln.category,
        title: `Implementar: ${vuln.question.replace('¿', '').replace('?', '')}`,
        description: getVulnerabilityRecommendation(vuln),
        actions: getVulnerabilityActions(vuln)
      });
    });

    return recs.slice(0, 8);
  };

  const getCategoryActions = (category, priority) => {
    const actions = {
      technical: {
        critical: [
          'Implementar firewall perimetral inmediatamente',
          'Activar antivirus en todos los equipos',
          'Configurar sistema de backups automáticos diarios'
        ],
        high: [
          'Actualizar todo el software a versiones recientes',
          'Implementar autenticación de dos factores',
          'Realizar auditoría de seguridad técnica'
        ]
      },
      human: {
        critical: [
          'Realizar capacitación urgente en ciberseguridad básica',
          'Implementar simulacros de phishing',
          'Designar un responsable de seguridad'
        ],
        high: [
          'Crear política de contraseñas fuertes',
          'Capacitar sobre ingeniería social',
          'Implementar sistema de reporte de incidentes'
        ]
      },
      organizational: {
        critical: [
          'Documentar política de seguridad empresarial',
          'Implementar control de accesos inmediatamente',
          'Crear plan de respuesta a incidentes'
        ],
        high: [
          'Realizar auditoría de cumplimiento',
          'Implementar gestión de usuarios y permisos',
          'Evaluar seguridad de proveedores'
        ]
      }
    };

    return actions[category]?.[priority] || [];
  };

  const getVulnerabilityRecommendation = (vuln) => {
    const recs = {
      't4': 'Las copias de seguridad son fundamentales. Un ransomware puede destruir su negocio sin backups.',
      't9': 'La autenticación 2FA previene el 99.9% de ataques por contraseña comprometida.',
      'h1': 'El 95% de brechas de seguridad involucran error humano. La capacitación es esencial.',
      'o1': 'Una política documentada establece las bases para toda su estrategia de seguridad.',
      'o5': 'Sin un plan de respuesta, un incidente menor puede convertirse en desastre.'
    };

    return recs[vuln.question] || 'Esta práctica es importante para mantener un nivel adecuado de seguridad.';
  };

  const getVulnerabilityActions = (vuln) => {
    return [
      'Revisar guías de implementación ISO 27001',
      'Asignar responsable y plazo de implementación',
      'Documentar el proceso implementado'
    ];
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return { level: 'Bajo', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' };
    if (score >= 60) return { level: 'Medio', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' };
    if (score >= 40) return { level: 'Alto', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50' };
    return { level: 'Crítico', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' };
  };

  const renderQuestionnaire = () => {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Evaluación de Ciberseguridad</h1>
            <p className="text-gray-600">Responda honestamente para obtener un diagnóstico preciso</p>
          </div>

          {Object.entries(categories).map(([catKey, category]) => {
            const Icon = category.icon;
            return (
              <div key={catKey} className="mb-8">
                <div className="flex items-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-800">{category.name}</h2>
                </div>
                
                <div className="space-y-4">
                  {category.questions.map(q => (
                    <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800 mb-3">{q.text}</p>
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleAnswer(q.id, 'yes')}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                            answers[q.id] === 'yes'
                              ? 'bg-green-500 text-white'
                              : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green-500'
                          }`}
                        >
                          <CheckCircle className="w-5 h-5 inline mr-2" />
                          Sí
                        </button>
                        <button
                          onClick={() => handleAnswer(q.id, 'no')}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                            answers[q.id] === 'no'
                              ? 'bg-red-500 text-white'
                              : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-red-500'
                          }`}
                        >
                          <XCircle className="w-5 h-5 inline mr-2" />
                          No
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <button
            onClick={calculateDiagnostic}
            disabled={Object.keys(answers).length < 23}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {Object.keys(answers).length < 23 
              ? `Responda todas las preguntas (${Object.keys(answers).length}/23)` 
              : 'Generar Diagnóstico Completo'}
          </button>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!diagnostic) return null;

    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Diagnóstico de Ciberseguridad</h1>
            <p className="text-gray-600">Fecha: {diagnostic.date}</p>
          </div>

          <div className={`${diagnostic.riskLevel.bgLight} border-2 rounded-lg p-6 mb-8`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Puntuación General</h2>
                <p className="text-gray-600">Nivel de madurez en ciberseguridad</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-gray-800">{diagnostic.overallScore.toFixed(0)}%</div>
                <div className={`inline-block px-4 py-2 rounded-full ${diagnostic.riskLevel.color} text-white font-bold mt-2`}>
                  Riesgo: {diagnostic.riskLevel.level}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Análisis por Categoría</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(diagnostic.categoryScores).map(([key, data]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-3">{data.name}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{data.score.toFixed(0)}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{data.points} de {data.maxPoints} puntos</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
              Vulnerabilidades Detectadas ({diagnostic.vulnerabilities.length})
            </h2>
            <div className="space-y-3">
              {diagnostic.vulnerabilities.slice(0, 10).map((vuln, idx) => (
                <div key={idx} className="bg-gray-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold mr-2 ${
                          vuln.severity === 'high' ? 'bg-red-500 text-white' :
                          vuln.severity === 'medium' ? 'bg-orange-500 text-white' :
                          'bg-yellow-500 text-white'
                        }`}>
                          {vuln.severity === 'high' ? 'CRÍTICO' : vuln.severity === 'medium' ? 'MEDIO' : 'BAJO'}
                        </span>
                        <span className="text-xs text-gray-500">{vuln.category}</span>
                      </div>
                      <p className="text-gray-800">{vuln.question}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
              Plan de Acción Recomendado
            </h2>
            <div className="space-y-4">
              {diagnostic.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mr-2 ${
                          rec.priority === 'critical' ? 'bg-red-500 text-white' :
                          rec.priority === 'high' ? 'bg-orange-500 text-white' :
                          'bg-yellow-500 text-white'
                        }`}>
                          Prioridad {rec.priority === 'critical' ? '1 - URGENTE' : rec.priority === 'high' ? '2 - ALTA' : '3 - MEDIA'}
                        </span>
                        <span className="text-xs text-gray-500">{rec.category}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">{rec.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{rec.description}</p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="font-bold text-blue-900 mb-2">Pasos a seguir:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-900">
                      {rec.actions.map((action, i) => (
                        <li key={i} className="text-sm">{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Resumen Ejecutivo</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Estado actual:</strong> Su empresa presenta un nivel de riesgo <strong>{diagnostic.riskLevel.level.toUpperCase()}</strong> en ciberseguridad.</p>
              <p><strong>Vulnerabilidades críticas:</strong> {diagnostic.vulnerabilities.filter(v => v.severity === 'high').length} detectadas que requieren atención inmediata.</p>
              <p><strong>Áreas de mejora:</strong> {Object.values(diagnostic.categoryScores).filter(s => s.score < 70).length} de 3 categorías necesitan refuerzo.</p>
              <p><strong>Próximos pasos:</strong> Implementar las {diagnostic.recommendations.length} recomendaciones priorizadas en un plazo de 30-90 días.</p>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              <FileText className="w-5 h-5 inline mr-2" />
              Descargar Reporte PDF
            </button>
            <button
              onClick={() => {
                setCurrentStep('questionnaire');
                setAnswers({});
                setDiagnostic(null);
              }}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700 transition"
            >
              Nueva Evaluación
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentStep === 'questionnaire' && renderQuestionnaire()}
      {currentStep === 'results' && renderResults()}
    </div>
  );
};

export default CybersecurityDiagnostic;
