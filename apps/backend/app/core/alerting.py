"""
Alerting system for monitoring critical metrics and sending notifications
"""
import asyncio
import logging
from typing import Dict, List, Callable, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class AlertSeverity(Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    EMERGENCY = "emergency"

class AlertChannel(Enum):
    EMAIL = "email"
    SLACK = "slack"
    SMS = "sms"
    WEBHOOK = "webhook"

@dataclass
class AlertRule:
    name: str
    condition: Callable[[], bool]
    severity: AlertSeverity
    channels: List[AlertChannel]
    cooldown_period: timedelta
    description: str
    enabled: bool = True

@dataclass
class Alert:
    rule_name: str
    severity: AlertSeverity
    message: str
    timestamp: datetime
    resolved: bool = False
    resolved_at: Optional[datetime] = None

class AlertManager:
    """Manages alert rules and notifications"""
    
    def __init__(self):
        self.rules: List[AlertRule] = []
        self.active_alerts: Dict[str, Alert] = {}
        self.alert_history: List[Alert] = []
        self.notification_channels = {}
        self.last_triggered: Dict[str, datetime] = {}
        
    def add_rule(self, rule: AlertRule):
        """Add a new alert rule"""
        self.rules.append(rule)
        logging.info(f"Added alert rule: {rule.name}")
    
    def add_notification_channel(self, channel: AlertChannel, config: Dict[str, Any]):
        """Configure notification channel"""
        self.notification_channels[channel] = config
    
    async def check_rules(self):
        """Check all alert rules"""
        for rule in self.rules:
            if not rule.enabled:
                continue
                
            # Check cooldown period
            last_trigger = self.last_triggered.get(rule.name)
            if last_trigger and datetime.now() - last_trigger < rule.cooldown_period:
                continue
            
            try:
                if await rule.condition():
                    await self.trigger_alert(rule)
            except Exception as e:
                logging.error(f"Error checking rule {rule.name}: {e}")
    
    async def trigger_alert(self, rule: AlertRule):
        """Trigger an alert based on rule"""
        alert = Alert(
            rule_name=rule.name,
            severity=rule.severity,
            message=rule.description,
            timestamp=datetime.now()
        )
        
        self.active_alerts[rule.name] = alert
        self.alert_history.append(alert)
        self.last_triggered[rule.name] = datetime.now()
        
        # Send notifications
        await self.send_notifications(alert, rule.channels)
        
        logging.critical(f"ALERT TRIGGERED: {rule.name} - {rule.description}")
    
    async def send_notifications(self, alert: Alert, channels: List[AlertChannel]):
        """Send notifications through configured channels"""
        for channel in channels:
            if channel in self.notification_channels:
                try:
                    await self._send_notification(alert, channel)
                except Exception as e:
                    logging.error(f"Failed to send {channel} notification: {e}")
    
    async def _send_notification(self, alert: Alert, channel: AlertChannel):
        """Send notification through specific channel"""
        config = self.notification_channels[channel]
        
        if channel == AlertChannel.EMAIL:
            await self._send_email_alert(alert, config)
        elif channel == AlertChannel.SLACK:
            await self._send_slack_alert(alert, config)
        elif channel == AlertChannel.SMS:
            await self._send_sms_alert(alert, config)
        elif channel == AlertChannel.WEBHOOK:
            await self._send_webhook_alert(alert, config)
    
    async def _send_email_alert(self, alert: Alert, config: Dict[str, Any]):
        """Send email alert"""
        msg = MIMEMultipart()
        msg['From'] = config['from_email']
        msg['To'] = config['to_email']
        msg['Subject'] = f"[{alert.severity.value.upper()}] Mirastros Alert: {alert.rule_name}"
        
        body = f"""
        ALERT DETAILS:
        ==============
        Rule: {alert.rule_name}
        Severity: {alert.severity.value}
        Time: {alert.timestamp}
        Message: {alert.message}
        
        This is an automated alert from Mirastros monitoring system.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        try:
            server = smtplib.SMTP(config['smtp_server'], config['smtp_port'])
            server.starttls()
            server.login(config['username'], config['password'])
            server.send_message(msg)
            server.quit()
        except Exception as e:
            raise Exception(f"Email sending failed: {e}")
    
    async def _send_slack_alert(self, alert: Alert, config: Dict[str, Any]):
        """Send Slack alert (placeholder)"""
        # Implementation would use Slack webhook
        pass
    
    async def _send_sms_alert(self, alert: Alert, config: Dict[str, Any]):
        """Send SMS alert (placeholder)"""
        # Implementation would use SMS gateway
        pass
    
    async def _send_webhook_alert(self, alert: Alert, config: Dict[str, Any]):
        """Send webhook alert (placeholder)"""
        # Implementation would send HTTP POST to webhook URL
        pass
    
    def resolve_alert(self, rule_name: str):
        """Mark alert as resolved"""
        if rule_name in self.active_alerts:
            alert = self.active_alerts[rule_name]
            alert.resolved = True
            alert.resolved_at = datetime.now()
            del self.active_alerts[rule_name]
            logging.info(f"Alert resolved: {rule_name}")

# Predefined alert rules
class StandardAlertRules:
    """Collection of standard alert rules for common scenarios"""
    
    @staticmethod
    def high_error_rate(threshold: float = 0.05):
        """Alert when error rate exceeds threshold"""
        async def condition():
            # Implementation would check actual error rate
            return False  # Placeholder
        return AlertRule(
            name="high_error_rate",
            condition=condition,
            severity=AlertSeverity.CRITICAL,
            channels=[AlertChannel.EMAIL, AlertChannel.SLACK],
            cooldown_period=timedelta(minutes=5),
            description=f"Error rate exceeded {threshold*100}% threshold"
        )
    
    @staticmethod
    def high_cpu_usage(threshold: float = 80.0):
        """Alert when CPU usage is too high"""
        async def condition():
            import psutil
            return psutil.cpu_percent() > threshold
        return AlertRule(
            name="high_cpu_usage",
            condition=condition,
            severity=AlertSeverity.WARNING,
            channels=[AlertChannel.EMAIL],
            cooldown_period=timedelta(minutes=10),
            description=f"CPU usage exceeded {threshold}%"
        )
    
    @staticmethod
    def low_memory(threshold: float = 20.0):
        """Alert when available memory is low"""
        async def condition():
            import psutil
            return psutil.virtual_memory().available / psutil.virtual_memory().total * 100 < threshold
        return AlertRule(
            name="low_memory",
            condition=condition,
            severity=AlertSeverity.WARNING,
            channels=[AlertChannel.EMAIL],
            cooldown_period=timedelta(minutes=15),
            description=f"Available memory below {threshold}%"
        )
    
    @staticmethod
    def database_connection_failed():
        """Alert when database connection fails"""
        async def condition():
            # Implementation would check database connection
            return False  # Placeholder
        return AlertRule(
            name="database_connection_failed",
            condition=condition,
            severity=AlertSeverity.EMERGENCY,
            channels=[AlertChannel.EMAIL, AlertChannel.SMS],
            cooldown_period=timedelta(minutes=1),
            description="Database connection failed"
        )
    
    @staticmethod
    def service_degraded():
        """Alert when service performance degrades"""
        async def condition():
            # Implementation would check response times
            return False  # Placeholder
        return AlertRule(
            name="service_degraded",
            condition=condition,
            severity=AlertSeverity.WARNING,
            channels=[AlertChannel.EMAIL],
            cooldown_period=timedelta(minutes=5),
            description="Service performance degraded"
        )

# Global alert manager instance
alert_manager = AlertManager()

# Initialize standard alerts
def initialize_standard_alerts():
    """Initialize standard alert rules"""
    alert_manager.add_rule(StandardAlertRules.high_cpu_usage(85.0))
    alert_manager.add_rule(StandardAlertRules.low_memory(15.0))
    alert_manager.add_rule(StandardAlertRules.database_connection_failed())
    alert_manager.add_rule(StandardAlertRules.service_degraded())

# Background monitoring task
async def monitoring_loop():
    """Background task to continuously monitor alerts"""
    while True:
        try:
            await alert_manager.check_rules()
            await asyncio.sleep(30)  # Check every 30 seconds
        except Exception as e:
            logging.error(f"Monitoring loop error: {e}")
            await asyncio.sleep(60)  # Wait longer on error

# Start monitoring
def start_monitoring():
    """Start the monitoring background task"""
    asyncio.create_task(monitoring_loop())